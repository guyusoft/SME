using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Xml;

namespace WxImage
{
    /// <summary>
    /// Summary description for WxToken
    /// </summary>
    public class WxToken : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            string token = "testwxtoken";
            if (string.IsNullOrEmpty(token))
            {
                return;
            }

            if (HttpContext.Current.Request.HttpMethod.ToUpper() == "POST")
            {
                using (Stream stream = HttpContext.Current.Request.InputStream)
                {
                    Byte[] postBytes = new Byte[stream.Length];
                    stream.Read(postBytes, 0, (Int32)stream.Length);
                    var postString = Encoding.UTF8.GetString(postBytes);
                    //Handle(postString);

                    var xmlDoc = new XmlDocument();
                    xmlDoc.LoadXml(postString);
                    var response = TextHandle(xmlDoc);
                    HttpContext.Current.Response.Write(response);
                    HttpContext.Current.Response.End();
                }
            }
            else
            {

                string echoString = HttpContext.Current.Request.QueryString["echoStr"];
                string signature = HttpContext.Current.Request.QueryString["signature"];
                string timestamp = HttpContext.Current.Request.QueryString["timestamp"];
                string nonce = HttpContext.Current.Request.QueryString["nonce"];

                if (!string.IsNullOrEmpty(echoString))
                {
                    HttpContext.Current.Response.Write(echoString);
                    HttpContext.Current.Response.End();
                }
            }
        }

        public string TextHandle(XmlDocument xmldoc)
        {
            string responseContent = "";
            XmlNode ToUserName = xmldoc.SelectSingleNode("/xml/ToUserName");
            XmlNode FromUserName = xmldoc.SelectSingleNode("/xml/FromUserName");
            XmlNode Content = xmldoc.SelectSingleNode("/xml/Content");
            if (Content != null)
            {
                responseContent = string.Format(Message_Text,FromUserName.InnerText,ToUserName.InnerText,DateTime.Now.Ticks,
                   "欢迎使用微信公共账号，您输入的内容为：" + Content.InnerText + "\r\n<a href=\"http://www.cnblogs.com\">点击进入</a>");
            }
            return responseContent;
        }
        /// <summary>
        /// 普通文本消息
        /// </summary>
        public static string Message_Text
        {
            get
            {
                return @"<xml>
                            <ToUserName><![CDATA[{0}]]></ToUserName>
                            <FromUserName><![CDATA[{1}]]></FromUserName>
                             <CreateTime>{2}</CreateTime>
                            <MsgType><![CDATA[text]]></MsgType>
                             <Content><![CDATA[{3}]]></Content>
                             </xml>";
            }
        }

        public bool IsReusable
        {
            get { return false; }
        }
    }
}