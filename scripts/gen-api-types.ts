import fs from 'fs'
import http from 'http'
import https from 'https'
import minimist from 'minimist'
import path from 'path'
import { loadEnvFromEnv } from './load-env'
// @ts-nocheck
// ─── 参数解析 ───────────────────────────────────────────
const args = minimist(process.argv.slice(2))
const mode = args.mode || 'dev'
const output = args.output || 'src/types/api.d.ts'

loadEnvFromEnv(mode)

const origin = process.env.APP_API_ORIGIN
if (!origin) {
  console.error('❌ APP_API_ORIGIN 未配置，请检查 .env.' + mode)
  process.exit(1)
}

const url = `${origin}/api-json`
const outputPath = path.resolve(process.cwd(), output)

// ─── 工具函数 ───────────────────────────────────────────

/** 通过 http/https 获取 JSON */
function fetchJSON(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client
      .get(url, (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(new Error('JSON 解析失败'))
          }
        })
      })
      .on('error', reject)
  })
}

/** 解析 $ref 引用，返回 schema 名称 */
function resolveRef(ref: string): string {
  // "#/components/schemas/UserResponseDto" → "UserResponseDto"
  const parts = ref.split('/')
  return parts[parts.length - 1]
}

/** 将 OpenAPI schema 转为 TypeScript 类型字符串 */
function schemaToTS(schema: any, indent: string = '  '): string {
  if (!schema) return 'unknown'

  // $ref
  if (schema.$ref) {
    return resolveRef(schema.$ref)
  }

  // allOf / oneOf / anyOf
  if (schema.allOf) {
    return schema.allOf.map((s: any) => schemaToTS(s, indent)).join(' & ')
  }
  if (schema.oneOf) {
    return schema.oneOf.map((s: any) => schemaToTS(s, indent)).join(' | ')
  }
  if (schema.anyOf) {
    return schema.anyOf.map((s: any) => schemaToTS(s, indent)).join(' | ')
  }

  // enum
  if (schema.enum) {
    return schema.enum
      .map((v: any) => (typeof v === 'string' ? `'${v}'` : String(v)))
      .join(' | ')
  }

  // array
  if (schema.type === 'array') {
    const itemType = schema.items ? schemaToTS(schema.items, indent) : 'unknown'
    // 如果 itemType 包含 | 或 &，加括号
    const needParen = itemType.includes('|') || itemType.includes('&')
    return needParen ? `(${itemType})[]` : `${itemType}[]`
  }

  // object
  if (schema.type === 'object' || schema.properties) {
    if (schema.properties) {
      return objectToTS(schema, indent)
    }
    if (schema.additionalProperties) {
      const valType = schemaToTS(schema.additionalProperties, indent)
      return `Record<string, ${valType}>`
    }
    return 'Record<string, unknown>'
  }

  // primitive
  switch (schema.type) {
    case 'string':
      return 'string'
    case 'number':
    case 'integer':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'null':
      return 'null'
    default:
      // 无 type 但有 nullable
      if (schema.nullable) return 'unknown | null'
      return 'unknown'
  }
}

/** 将 object schema 转为内联 TS 对象类型 */
function objectToTS(schema: any, indent: string): string {
  const props = schema.properties || {}
  const required = new Set(schema.required || [])
  const lines: string[] = ['{']
  const innerIndent = indent + '  '

  for (const [key, prop] of Object.entries<any>(props)) {
    const opt = required.has(key) ? '' : '?'
    const desc = prop.description
    if (desc) {
      lines.push(`${innerIndent}/** ${desc} */`)
    }
    const tsType = schemaToTS(prop, innerIndent)
    const nullable = prop.nullable ? ` | null` : ''
    const readonly = prop.readOnly ? 'readonly ' : ''
    lines.push(`${innerIndent}${readonly}${key}${opt}: ${tsType}${nullable};`)
  }

  lines.push(`${indent}}`)
  return lines.join('\n')
}

/** 生成单个 interface 的字符串 */
function generateInterface(name: string, schema: any): string {
  const lines: string[] = []
  const props = schema.properties || {}
  const required = new Set(schema.required || [])

  // 顶层 JSDoc
  if (schema.description) {
    lines.push(`  /** ${schema.description} */`)
  }

  lines.push(`  interface ${name} {`)

  for (const [key, prop] of Object.entries<any>(props)) {
    const opt = required.has(key) ? '' : '?'
    const desc = prop.description
    const example = prop.example

    // JSDoc
    const jsdocParts: string[] = []
    if (desc) jsdocParts.push(desc)
    if (example !== undefined && typeof example !== 'object') {
      jsdocParts.push(`@example ${example}`)
    }
    if (jsdocParts.length === 1) {
      lines.push(`    /** ${jsdocParts[0]} */`)
    } else if (jsdocParts.length > 1) {
      lines.push(`    /**`)
      jsdocParts.forEach((p) => lines.push(`     * ${p}`))
      lines.push(`     */`)
    }

    const tsType = schemaToTS(prop, '    ')
    const nullable = prop.nullable ? ' | null' : ''
    const readonly = prop.readOnly ? 'readonly ' : ''
    lines.push(`    ${readonly}${key}${opt}: ${tsType}${nullable};`)
  }

  lines.push(`  }`)
  return lines.join('\n')
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** 从 operations 中提取 query 参数类型 */
function generateQueryParams(operations: Record<string, any>): string[] {
  const results: string[] = []

  for (const [opId, op] of Object.entries<any>(operations)) {
    const queryParams = op.parameters?.query
    if (!queryParams || typeof queryParams !== 'object') continue

    // 将 operationId 转为 PascalCase 参数名
    // e.g. "UsersController_findAll" → "UsersQueryParams"
    const parts = opId.split('_')
    const controller = parts[0].replace('Controller', '')
    const method = parts.slice(1).join('')
    const typeName = `${controller}${capitalize(method)}Params`

    const lines: string[] = []
    lines.push(`  interface ${typeName} {`)

    for (const [key, prop] of Object.entries<any>(queryParams)) {
      const desc = (prop as any).description
      if (desc) lines.push(`    /** ${desc} */`)
      const tsType = schemaToTS(prop, '    ')
      lines.push(`    ${key}?: ${tsType};`)
    }

    lines.push(`  }`)
    results.push(lines.join('\n'))
  }

  return results
}

/** 从 paths 中提取所有 operation 及其 query 参数 */
function extractOperations(paths: Record<string, any>): Record<string, any> {
  const ops: Record<string, any> = {}
  const methods = ['get', 'post', 'put', 'patch', 'delete']

  for (const [, pathItem] of Object.entries(paths)) {
    for (const method of methods) {
      const operation = pathItem[method]
      if (!operation) continue

      // 从 parameters 中提取 query
      const params = operation.parameters
      if (!params || !Array.isArray(params)) continue

      const queryObj: Record<string, any> = {}
      let hasQuery = false

      for (const param of params) {
        if (param.in === 'query') {
          hasQuery = true
          queryObj[param.name] = {
            ...param.schema,
            description: param.description || param.schema?.description,
          }
        }
      }

      if (hasQuery && operation.operationId) {
        ops[operation.operationId] = { parameters: { query: queryObj } }
      }
    }
  }

  return ops
}

// ─── 主流程 ─────────────────────────────────────────────

async function generate() {
  console.log(`🔗 OpenAPI 地址: ${url}`)
  console.log(`📦 输出文件: ${output}`)

  const spec = await fetchJSON(url)

  if (!spec?.components?.schemas) {
    console.error('❌ OpenAPI 文档中未找到 components.schemas')
    process.exit(1)
  }

  const schemas: Record<string, any> = spec.components.schemas
  const operations: Record<string, any> = spec.paths
    ? extractOperations(spec.paths)
    : {}

  // 生成文件内容
  const lines: string[] = []
  lines.push('/**')
  lines.push(' * 此文件由 scripts/gen-api-types.ts 自动生成')
  lines.push(` * 生成时间: ${new Date().toISOString()}`)
  lines.push(` * 数据来源: ${url}`)
  lines.push(' * 请勿手动修改此文件')
  lines.push(' */')
  lines.push('')
  lines.push('declare namespace API {')

  // 1. schemas → interfaces
  for (const [name, schema] of Object.entries(schemas)) {
    lines.push('')
    lines.push(generateInterface(name, schema))
  }

  // 2. query params from operations
  const queryTypes = generateQueryParams(operations)
  if (queryTypes.length > 0) {
    lines.push('')
    lines.push('  // ─── Query 参数类型 ─────────────────────────')
    for (const qt of queryTypes) {
      lines.push('')
      lines.push(qt)
    }
  }

  // 3. 通用分页响应
  lines.push('')
  lines.push('  // ─── 通用类型 ───────────────────────────────')
  lines.push('')
  lines.push('  interface PaginatedResponse<T> {')
  lines.push('    items: T[];')
  lines.push('    total: number;')
  lines.push('    page: number;')
  lines.push('    pageSize: number;')
  lines.push('  }')

  lines.push('')
  lines.push('  interface Response<T = unknown> {')
  lines.push('    success: boolean;')
  lines.push('    code: number;')
  lines.push('    message: string;')
  lines.push('    data: T;')
  lines.push('    timestamp?: string;')
  lines.push('    path?: string;')
  lines.push('  }')

  lines.push('}')
  lines.push('')

  // 写入文件
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8')
  console.log(`✅ 类型文件已生成: ${outputPath}`)
  console.log(`   📊 共 ${Object.keys(schemas).length} 个 Schema`)
  console.log(`   📊 共 ${queryTypes.length} 个 Query Params`)
}

generate().catch((err) => {
  console.error(`❌ 生成失败: ${err.message}`)
  process.exit(1)
})
