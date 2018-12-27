// es7草案不支持 ParamDecorator,不过typescript自己实现了。
// 所以该套方案只能在typescript中使用
const RouteParamtypes = {
  BODY: 0,
  QUERY: 1,
  PARAM: 2,
  CONTEXT: 3,
  NEXT: 4,
  USER: 5
}
module.exports = RouteParamtypes
