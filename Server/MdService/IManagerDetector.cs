using System.ServiceModel;
using System.ServiceModel.Web;

namespace MdService
{
    [ServiceContract]
    public interface IManagerDetector
    {
        [OperationContract]
        [WebGet(UriTemplate = "Settings/{userId}", ResponseFormat = WebMessageFormat.Json)]
        string GetUserSettings(string userId);

        [OperationContract]
        [WebInvoke(
           RequestFormat = WebMessageFormat.Json,
           ResponseFormat =  WebMessageFormat.Json,
           Method = "POST",
           UriTemplate = "Settings/{userId}",
           BodyStyle = WebMessageBodyStyle.Bare)]
        void SaveUserSettings(string userId, string settings);
    }
}
