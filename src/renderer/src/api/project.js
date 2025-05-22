import request from "../utils/http/request";

/**
 * 获取项目列表数据
 */
export const ProjectListService = () => {
  return request.get("/project/list")
}

/**
 * 根据项目ID查询项目下的商品列表
 */
export const ProjectGoodsService = (projectId) => {
  return request.get("/project/commodity", {
    params: {
      projectId
    }
  })
}
