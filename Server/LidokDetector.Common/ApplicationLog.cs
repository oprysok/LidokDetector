using System;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Runtime.CompilerServices;
using JetBrains.Annotations;
using log4net;
using log4net.Appender;
using log4net.Config;
using log4net.Repository.Hierarchy;

[assembly: XmlConfigurator(Watch = true)]

namespace LidokDetector.Common
{
    /// <summary>
    ///     Logging class to provide tracing and logging support
    ///     <remarks>
    ///         There are five different logging levels (fatal, error, warning, info, trace)
    ///         that produce output to the destination as specified in the current ApplicationConfiguration settings.
    ///     </remarks>
    /// </summary>
    [DebuggerNonUserCode]
    public class ApplicationLog
    {
        #region Private members

        private ILog logger;

        private const string DefaultLogger = "DefaultLogger";
        private const string AuditLogger = "AuditLogger";

        private readonly string currentLoggerName;

        #endregion

        /// <summary>
        /// Name of a logger
        /// </summary>
        public string LoggerName
        {
            get { return currentLoggerName; }
            set { logger = LogManager.GetLogger(value); }
        }

        #region Constructors

        /// <summary>
        /// This constructor put the logger name to be as the loggerName parameter.
        /// </summary>
        /// <param name="loggerName">The logger name</param>
        private ApplicationLog(string loggerName)
        {
            currentLoggerName = !string.IsNullOrEmpty(loggerName) ? loggerName : DefaultLogger;
            logger = LogManager.GetLogger(currentLoggerName);
        }

        /// <summary>
        /// Creates a logger with name set to a type of the passed object
        /// </summary>
        /// <param name="parentInstance">Object to create logger for</param>
        /// <returns>Logger instance</returns>
        public static ApplicationLog CreateLogger(object parentInstance)
        {
            return new ApplicationLog(parentInstance.GetType().Name);
        }

        /// <summary>
        /// Creates a logger with name set to a generic type
        /// </summary>
        /// <returns>Logger instance</returns>
        public static ApplicationLog CreateLogger<T>()
        {
            return new ApplicationLog(typeof(T).Name);
        }

        /// <summary>
        /// Creates a logger with name set to specified type
        /// </summary>
        /// <param name="loggerType">Type to create logger for</param>
        /// <returns>Logger instance</returns>
        public static ApplicationLog CreateLogger(Type loggerType)
        {
            return new ApplicationLog(loggerType.Name);
        }

        public static ApplicationLog CreateAuditLogger()
        {
            return new ApplicationLog(AuditLogger);
        }

        #endregion

        #region Public Write Methods

        /// <summary>
        /// Write to log at the Warning level. 
        /// This call should be followed with <see cref="ApplicationLogData.Write(string,object[])"/> method call 
        /// or <see cref="ApplicationLogData.Write(string,System.Exception)"/> call.
        /// </summary>
        public ApplicationLogData Fatal([CallerMemberName] string caller = null)
        {
            return FatalEnabled
                ? new ApplicationLogData(logger.Fatal, logger.Fatal, caller, logger.Logger.Name)
                : ApplicationLogData.Empty;
        }

        /// <summary>
        /// Write to log at the Error level. 
        /// This call should be followed with <see cref="ApplicationLogData.Write(string,object[])"/> method call 
        /// or <see cref="ApplicationLogData.Write(string,System.Exception)"/> call.
        /// </summary>
        public ApplicationLogData Error([CallerMemberName] string caller = null)
        {
            return ErrorEnabled
                ? new ApplicationLogData(logger.Error, logger.Error, caller, logger.Logger.Name)
                : ApplicationLogData.Empty;
        }

        /// <summary>
        /// Write to log at the Warning level. 
        /// This call should be followed with <see cref="ApplicationLogData.Write(string,object[])"/> method call 
        /// or <see cref="ApplicationLogData.Write(string,System.Exception)"/> call.
        /// </summary>
        public ApplicationLogData Warning([CallerMemberName] string caller = null)
        {
            return WarnEnabled
                ? new ApplicationLogData(logger.Warn, logger.Warn, caller, logger.Logger.Name)
                : ApplicationLogData.Empty;

        }

        /// <summary>
        /// Write to log at the Info level. 
        /// This call should be followed with <see cref="ApplicationLogData.Write(string,object[])"/> method call 
        /// or <see cref="ApplicationLogData.Write(string,System.Exception)"/> call.
        /// </summary>
        /// <param name="caller">CallerMemberName compiler attribute</param>
        /// <returns>ApplicationLogData object containing necessary caller information</returns>
        public ApplicationLogData Info([CallerMemberName] string caller = null)
        {
            return InfoEnabled
                ? new ApplicationLogData(logger.Info, logger.Info, caller, logger.Logger.Name)
                : ApplicationLogData.Empty;
        }

        /// <summary>
        /// Write to log at the Trace level. 
        /// This call should be followed with <see cref="ApplicationLogData.Write(string,object[])"/> method call 
        /// or <see cref="ApplicationLogData.Write(string,System.Exception)"/> call.
        /// </summary>
        public ApplicationLogData Trace([CallerMemberName] string caller = null)
        {
            return TraceEnabled
                ? new ApplicationLogData(logger.Debug, logger.Debug, caller, logger.Logger.Name)
                : ApplicationLogData.Empty;
        }

        #endregion

        #region Logging level properties

        /// <summary>
        /// Check for fatal logging level enabled
        /// </summary>
        public bool FatalEnabled
        {
            get { return logger.IsFatalEnabled; }
        }

        /// <summary>
        /// Check for error logging level enabled
        /// </summary>
        public bool ErrorEnabled
        {
            get { return logger.IsErrorEnabled; }
        }

        /// <summary>
        /// Check for warning logging level enabled
        /// </summary>
        public bool WarnEnabled
        {
            get { return logger.IsWarnEnabled; }
        }

        /// <summary>
        /// Check for info logging level enabled
        /// </summary>
        public bool InfoEnabled
        {
            get { return logger.IsInfoEnabled; }
        }

        /// <summary>
        /// Check for trace logging level enabled
        /// </summary>
        public bool TraceEnabled
        {
            get { return logger.IsDebugEnabled; }
        }

        #endregion

        public static void UpdateDestinationFolder(string instanceName)
        {
            XmlConfigurator.Configure();
            var hierarchy = (Hierarchy)LogManager.GetRepository();
            foreach (var appender in hierarchy.Root.Appenders)
            {
                var fileAppender = appender as FileAppender;
                if (fileAppender != null)
                {
                    FileInfo fileInfo = new FileInfo(fileAppender.File);
                    if (fileInfo.DirectoryName != null)
                    {
                        string logFileLocation = Path.Combine(fileInfo.DirectoryName, instanceName, fileInfo.Name);

                        fileAppender.File = logFileLocation;
                        fileAppender.ActivateOptions();
                        break;
                    }
                }
            }
        }
    }


    /// <summary>
    /// Struct used for logging purposes. 
    /// </summary>
    [DebuggerNonUserCode]
    public struct ApplicationLogData
    {
        private readonly Action<string> logAction;
        private readonly Action<string, Exception> logExceptionAction;

        private readonly bool isEligible;
        private readonly string caller;
        private readonly string logger;

        internal static ApplicationLogData Empty = new ApplicationLogData();

        internal ApplicationLogData(Action<string> logAction, Action<string, Exception> logExceptionAction, string caller, string logger)
        {
            this.logAction = logAction;
            this.logExceptionAction = logExceptionAction;
            this.caller = caller;
            this.logger = logger;

            isEligible = (logAction != null);
        }

        /// <summary>
        /// Writes exception and its stack trace to the specified level
        /// </summary>
        /// <param name="logMessage">A composite format string.</param>
        /// <param name="args">An object array that contains zero or more objects to format</param>
        [StringFormatMethod("logMessage")]
        public void Write(string logMessage, params object[] args)
        {
            if (IsEligible())
            {
                Log(String.Format(CultureInfo.InvariantCulture, logMessage, args));
            }
        }

        /// <summary>
        /// Writes only message (without log name and caller info)
        /// </summary>
        /// <param name="logMessage">A composite format string.</param>
        /// <param name="args">An object array that contains zero or more objects to format</param>
        [StringFormatMethod("logMessage")]
        public void WriteOnlyMessage(string logMessage, params object[] args)
        {
            if (IsEligible())
            {
                logAction.Invoke(String.Format(CultureInfo.InvariantCulture, logMessage, args));
            }
        }

        /// <summary>
        /// Writes exception and its stack trace to the specified level
        /// </summary>
        /// <param name="logMessage">Log string</param>
        /// <param name="exception">Exception details</param>
        public void Write(string logMessage, Exception exception)
        {
            if (IsEligible())
            {
                LogException(logMessage, exception);
            }
        }

        /// <summary>
        /// Writes exception and formatted string to the specified level
        /// </summary>
        /// <param name="ex">Exception details</param>
        /// <param name="logMessage">A composite format string.</param>
        /// <param name="args">An object array that contains zero or more objects to format</param>
        [StringFormatMethod("logMessage")]
        public void Write(Exception ex, string logMessage, params object[] args)
        {
            if (IsEligible())
            {
                LogException(String.Format(CultureInfo.InvariantCulture, logMessage, args), ex);
            }
        }

        private bool IsEligible()
        {
            return isEligible;
        }

        private void Log(string logMessage)
        {
            logAction.Invoke(FormatMessage(logger, caller, logMessage));
        }

        private void LogException(string logMessage, Exception ex)
        {
            logExceptionAction.Invoke(FormatMessage(logger, caller, logMessage), ex);
        }

        private static string FormatMessage(string loggerName, string caller, string message)
        {
            return string.Format("[{0}.{1}] {2}", loggerName, !string.IsNullOrEmpty(caller) ? caller : "<unknown>", message);
        }
    }



}

