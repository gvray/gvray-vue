<template>
  <PageContainer>
    <div class="docs-page">
      <div class="docs-page__section-title">数据源说明</div>
      <ul class="docs-page__list">
        <li>
          开发环境（dev）：<code>APP_API_URL=/api</code>，默认启用本地
          Mock（<code>APP_MOCK_ENABLED=true</code>）
        </li>
        <li>
          测试环境（staging）：<code>APP_API_URL=http://localhost:3000</code>，连接后端
          gvray-admin，Mock 关闭
        </li>
      </ul>

      <div class="docs-page__section-title">环境变量</div>
      <pre class="docs-page__code">{{ envExample }}</pre>

      <div class="docs-page__note">
        Mock 目录：~/mock（仅覆盖登录/用户模块），其余模块需连接后端。
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from '@/components/PageContainer/index.vue'

const envExample = `.env.dev
APP_ENV=dev
APP_API_URL=/api
APP_MOCK_ENABLED=true

.env.staging
APP_ENV=staging
APP_API_URL=http://localhost:3000
APP_MOCK_ENABLED=false`
</script>

<style lang="scss" scoped>
.docs-page {
  font-size: 14px;
  line-height: 1.8;
  color: #1f1f1f;
}

.docs-page__section-title {
  font-weight: 600;
  margin-bottom: 8px;

  &:not(:first-child) {
    margin-top: 12px;
  }
}

.docs-page__list {
  padding-left: 18px;
  margin: 0;
}

.docs-page__code {
  background: var(--gvray-color-fill, #f5f5f5);
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  overflow-x: auto;
  margin: 8px 0;
}

.docs-page__note {
  margin-top: 8px;
  color: #595959;
}

code {
  background: var(--gvray-color-fill, #f5f5f5);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}
</style>
