using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.ServiceModel;
using System.ServiceModel.Description;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;
using MdService;

namespace SimpleClient
{
    class Program
    {
        static void Main(string[] args)
        {		
            var channelFactory = new ChannelFactory<IManagerDetector>(new WebHttpBinding("FunBinding"), GetEndpointAddress());
            channelFactory.Endpoint.Behaviors.Add(new WebHttpBehavior());
            var channel = channelFactory.CreateChannel(); 

            channel.SaveUserSettings("a", "b");
        }

        private static string GetEndpointAddress()
        {
			Console.Write("Enter host name: ");
			var hostName = Console.ReadLine();
            return string.Format("http://{0}/ManagerDetector/", hostName);
        }
    }
}
