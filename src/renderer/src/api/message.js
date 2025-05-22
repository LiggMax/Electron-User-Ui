import request from "../utils/http/request";

/**
 * 获取公告内容
 */
export function getAnnouncement() {
  return request({
    url: "/user/message/announcement",
    method: "get",
  });
}