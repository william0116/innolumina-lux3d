// ---- plugin:ai_glassware_image_generation_1 ----
// ============================================================
// 插件 ai_glassware_image_generation_1 (琉璃器物效果图生成) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface AiGlasswareImageGenerationOneInput {
  /** 图片比例，可选值：1:1、4:3、3:4、16:9、9:16、3:2、2:3，默认1:1 */
  image_ratio?: string;
  /** 琉璃器物的具体文字描述，包含造型、颜色、风格、用途等细节信息 */
  glassware_description: string;
}

/**
 * capabilityClient.load('ai_glassware_image_generation_1').call<AiGlasswareImageGenerationOneOutput>('textToImage', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { images } = result;
 * 返回值形如：
 *   {"images":["示例文本"]}
 */
export interface AiGlasswareImageGenerationOneOutput {
  /** [object Object] */
  images: string[];
}
// ---- end:ai_glassware_image_generation_1 ----

// ---- plugin:colored_glaze_2d_to_3d_1 ----
// ============================================================
// 插件 colored_glaze_2d_to_3d_1 (琉璃2D转3D风格转换) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface ColoredGlazeTwoDToThreeDOneInput {
  /** 待转换的2D琉璃效果图 */
  glaze_image: string[];
  /** 自定义转换要求（如指定线框风格、渲染材质等，可选） */
  custom_requirement?: string;
  /** 输出图片比例，支持1:1、4:3、3:4、16:9、9:16、3:2、2:3，默认为1:1（可选） */
  image_ratio?: string;
}

/**
 * capabilityClient.load('colored_glaze_2d_to_3d_1').call<ColoredGlazeTwoDToThreeDOneOutput>('imageToImage', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { images } = result;
 * 返回值形如：
 *   {"images":["示例文本"]}
 */
export interface ColoredGlazeTwoDToThreeDOneOutput {
  /** [object Object] */
  images: string[];
}
// ---- end:colored_glaze_2d_to_3d_1 ----