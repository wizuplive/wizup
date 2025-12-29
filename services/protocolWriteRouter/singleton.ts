import { createProtocolWriteRouter } from "./createProtocolWriteRouter";

let _router: ReturnType<typeof createProtocolWriteRouter> | null = null;

export function protocolWriteRouter() {
  if (_router) return _router;
  _router = createProtocolWriteRouter();
  return _router;
}
