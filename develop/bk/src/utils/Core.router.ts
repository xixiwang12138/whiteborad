
export function body(filedName: string, req) {
    return eval('req.body.'+filedName) as string;
}

export function param(filedName: string, req) {
  return eval('req.query.'+filedName) as string;
}

export function header(filedName: string, req) {
  return eval('req.header.'+filedName) as string;
}
