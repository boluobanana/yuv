interface Attrib {
  buffer: WebGLBuffer,
  numComponents: number,
  type: WebGLRenderingContextBase["FLOAT"] | WebGLRenderingContextBase["BYTE"]
      | WebGLRenderingContextBase["UNSIGNED_BYTE"] | WebGLRenderingContextBase["SHORT"]
      | WebGLRenderingContextBase["UNSIGNED_SHORT"] | WebGLRenderingContextBase["INT"]
      | WebGLRenderingContextBase["UNSIGNED_INT"],
  normalize: boolean
}
interface Attribs {
  [name: string]: Attrib
}
interface BufferInfo {
  attribs: Attribs,
  indices: ArrayBuffer,
  numElements: number
}


declare function createAugmentedTypedArray<T>(numComponents: number, numElements: number, opt_type?: T | Float32Array): T | Float32Array
declare function createAttribsFromArrays(gl: WebGLRenderingContext, arrays: any, opt_mapping?: any): Attribs
declare function createBuffersFromArrays(gl: WebGLRenderingContext, arrays:any): {[name:string]: WebGLBuffer}
declare function createBufferInfoFromArrays(gl: WebGLRenderingContext, arrays: any, opt_mapping?: any): BufferInfo
// declare function createAttributeSetters(gl: WebGLRenderingContext, program: WebGLProgram)