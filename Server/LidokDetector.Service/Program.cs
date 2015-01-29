using System;
using System.Security.Cryptography;
using System.Text;
using LidokDetector.Common;
using LidokDetector.Service.Properties;
using Topshelf;

namespace LidokDetector.Service
{
    internal class Program
    {
        private static ApplicationLog log = ApplicationLog.CreateLogger<Program>();

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
                        {
                            log.Info().Write("Starting service");
                            ots.Start(UnprotectSetting(Settings.Default.UserAccount),
                                UnprotectSetting(Settings.Default.UserPassword));
                            AppDomain.CurrentDomain.UnhandledException += (sender, ex) =>
                            {
                                log.Error().Write("Unhandled exception", (Exception) ex.ExceptionObject);
                            };
                        });
                    s.WhenStopped(ots =>
                    {
                        log.Info().Write("Stopping service");
                        ots.Stop();
                    });
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
