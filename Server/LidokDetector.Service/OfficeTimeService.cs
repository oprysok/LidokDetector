using System;
using LidokDetector.Service.Polling;
using LidokDetector.Service.Properties;
using Microsoft.Owin.Hosting;

namespace LidokDetector.Service
{
    internal class OfficeTimeService
    {
        private readonly string baseAddress = Settings.Default.BaseAddress;
        private readonly PollService pollService = new PollService();

        private IDisposable webApiHandle;


        public void Start(string requestAccount, string requestPassword)
        {
            webApiHandle = WebApp.Start<Startup>(baseAddress);
            pollService.StartPolling(requestAccount, requestPassword);
        }

        public void Stop()
        {
            pollService.Dispose();
            webApiHandle.Dispose();
        }
    }
}