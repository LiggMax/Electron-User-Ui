import {defineStore} from "pinia";
import {ref} from "vue";

const userInfoStore = defineStore('userInfo',()=>{

  //响应式变量
  const userInfo = ref({})

  //修改userInfo的值
  const setUserInfo = (newUserInfo)=>{
    userInfo.value = newUserInfo
  }

  //移除userInfo的值
  const removeUserInfo = ()=>{
    userInfo.value = {}
  }
  return {userInfo,setUserInfo,removeUserInfo}
},{
  persist:true //持久化
});
export default userInfoStore;
