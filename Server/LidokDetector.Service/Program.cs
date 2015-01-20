using System;
using System.Security.Cryptography;
using System.Text;
using LidokDetector.Service.Properties;
using Topshelf;

namespace LidokDetector.Service
{
    internal class Program
    {
        private static void Main(string[] args)
        {
            string serviceAccount = UnprotectSetting(Settings.Default.ServiceAccount);
            string servicePassword = UnprotectSetting(Settings.Default.ServicePassword);

            HostFactory.Run(x =>
            {
                x.Service<OfficeTimeService>(s =>
                {
                    s.ConstructUsing(_ => new OfficeTimeService());
                    s.WhenStarted(
                        ots =>
                            ots.Start(UnprotectSetting(Settings.Default.UserAccount),
                                UnprotectSetting(Settings.Default.UserPassword)));
                    s.WhenStopped(ots => ots.Stop());
                });

                x.SetServiceName("LidokDetectorService");
                x.SetDescription("Retrieves Lidok office availability");

                x.StartAutomatically();

                x.RunAs(serviceAccount, servicePassword);
            });
        }

        private static string UnprotectSetting(string value)
        {
            var protectedBytes = Convert.FromBase64String(value);
            var unprotectedBytes = ProtectedData.Unprotect(protectedBytes, null, DataProtectionScope.CurrentUser);
            return Encoding.Default.GetString(unprotectedBytes);
        }
    }
}
