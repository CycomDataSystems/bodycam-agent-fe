/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JUDICIAL_API_URL: string
  /** Sara's token-issuing Lambda, fronted by API Gateway. No auth in front
   * of it yet — see src/api/tokenLambda.ts for why we never send role
   * other than "user" from this app regardless. */
  readonly VITE_TOKEN_LAMBDA_URL: string
  /**
   * Manual override — bypasses the Lambda entirely and uses this token
   * directly. Only for edge-case debugging; never a long-lived or
   * admin-role token in practice, and never committed — see .env.example.
   */
  readonly VITE_DEV_JWT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
