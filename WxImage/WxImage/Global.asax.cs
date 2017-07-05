using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Security;
using System.Web.SessionState;

namespace WxImage
{
    public class Global : System.Web.HttpApplication
    {
        private static string _token = "";
        public static string AccessToken
        {
            get
            {
                if (string.IsNullOrWhiteSpace(_token))
                {
                    var url = string.Format("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={0}&secret={1}", "wx9d21eaf7897db97b", "983448ba5f135d440f5348a148bc519d");
                    var wc = new WebClient();
                    _token = wc.DownloadString(url);
                }
                return _token;
            }
        }
        protected void Application_Start(object sender, EventArgs e)
        {
        }

        protected void Session_Start(object sender, EventArgs e)
        {

        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {

        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        protected void Application_Error(object sender, EventArgs e)
        {

        }

        protected void Session_End(object sender, EventArgs e)
        {

        }

        protected void Application_End(object sender, EventArgs e)
        {

        }
    }
}