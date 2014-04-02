using NLog;

namespace MdService
{
    public class ManagerDetectorService : IManagerDetector
    {
        private Logger log = LogManager.GetCurrentClassLogger();

        public string GetUserSettings(string userId)
        {
            log.Info("GetUserSettings invoked");
            return "";
        }

        public void SaveUserSettings(string userId, string settings)
        {
            log.Info("SaveUserSettings ({0}, {1}) invoked");
        }
    }
}
