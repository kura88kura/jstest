/**
 * Created by yuzhou on 15/8/20.
 */
var obj_txt = '{"firstname": "terry", "lastname": "lee", "addr":{' +
    '"street": "中国村创业大街氪空间", "city": "北京"}}';

var obj = JSON.parse(obj_txt);

var str = "<h4>解析后的JSON对象数据结构:</h4><hr/>";

str += "姓: " + obj.firstname + "<br/>";
str += "名: " + obj.lastname + "<br/>";
str += "地址: " + obj.addr.street + "<br/>";
str += "城市: " + obj.addr.city + "<br/>";


document.write(str);