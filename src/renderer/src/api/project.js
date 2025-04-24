import request from "../utils/request";

/**
 * 获取项目列表数据
 */
export const ProjectListService = () => {
  return request.get("/project/list")
}
