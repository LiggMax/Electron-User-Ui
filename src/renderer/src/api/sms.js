import request from "../utils/request";

/**
 * 获取用户短信列表数据
 */
export const SmsListService = () => {
  return request.get("/sms")
}
