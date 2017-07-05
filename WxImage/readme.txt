1.为微信开发接口里面要求签名必须在服务端使用SHA1加密，所以纯粹的Javascript是无法实现的。
2.由于对于微信开发不熟悉，看完这个版本之后，发现我也只能按照这个思路去做。你说的那个微信上传不知道是指的什么？HTML5的画布功能吗？

今天比较晚了，我大致想了下，是不是我们要实现这样的功能：
首先，用户访问一个html页面，这个页面用户可以上传图片（拍照或者选择），然后用户选择好图片之后，这个页面负责将用户的图片上传到我们自己的服务器（新浪SCS)上去，然后服务器负责将上传的图片上传到微信?



20170705: 
今天使用.net版本，并申请了测试号进行了调试，现在可以收到如下的message并做处理。

在本地调试的时候，使用了免费的natapp将内网IP穿透之后进行调试的


<xml><ToUserName><![CDATA[gh_7170cc609246]]></ToUserName>
<FromUserName><![CDATA[o6D_b1FpEOyLDCG9VegytcgrnXJs]]></FromUserName>
<CreateTime>1499271235</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[ 哈哈]]></Content>
<MsgId>6439320922594137007</MsgId>
</xml>

这个是用户选择图片的

<xml><ToUserName><![CDATA[gh_7170cc609246]]></ToUserName>
<FromUserName><![CDATA[o6D_b1FpEOyLDCG9VegytcgrnXJs]]></FromUserName>
<CreateTime>1499271665</CreateTime>
<MsgType><![CDATA[image]]></MsgType>
<PicUrl><![CDATA[http://mmbiz.qpic.cn/mmbiz_jpg/ykjqBibNvAHMNGeAKDNiaJURcA2H0uFVZowpib7aRXrq76VrVE5YvalOLLwvicAKf0lNKF0InA2gbe5bNJbqKGQcLg/0]]></PicUrl>
<MsgId>6439322769430074334</MsgId>
<MediaId><![CDATA[KkqDLZAxNkV_WylyodCYQqdRIHg2KI36tX5FQwRADL45gB5bF00MT6JaEvJtw4LD]]></MediaId>
</xml>