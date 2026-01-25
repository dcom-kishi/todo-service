export const NextResponse = {
  redirect: (url: string | URL) => ({ url, status: 302 }),
  json: (data: any, init?: any) => ({ json: async () => data, ...init }),
};

export class NextRequest {
  constructor(public url: string, public init?: any) {}
}
