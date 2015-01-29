using System;
using LidokDetector.Service.Polling;
using LidokDetector.Service.Properties;
using Microsoft.Owin.Hosting;

namespace LidokDetector.Service
{
    internal class OfficeTimeService
    {
        private readonly string baseAddress = Settings.Default.BaseAddress;

        private IDisposable webApiHandle;


        public void Start(string requestAccount, string requestPassword)
        {
            webApiHandle = WebApp.Start<Startup>(baseAddress);
            PollService.Instance.StartPolling(requestAccount, requestPassword);
        }

        public void Stop()
        {
            PollService.Instance.Dispose();
            webApiHandle.Dispose();
        }
    }
}