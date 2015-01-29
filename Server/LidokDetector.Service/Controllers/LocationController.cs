using System;
using System.Web.Http;
using LidokDetector.Service.Polling;

namespace LidokDetector.Service.Controllers
{
    public class LocationController : ApiController
    {
        [Route("api/location/{locationName}/{personId}")]
        public IHttpActionResult Get(string locationName, string personId)
        {
            int parsedId;
            if (!int.TryParse(personId, out parsedId))
            {
                return BadRequest("Cannot parse personId");
            }

            string result;

            try
            {
                result = PollService.Instance.GetPersonData(locationName, parsedId);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }

            return new RawJsonContent(result);
        }

        [Route("api/location/employees")]
        public IHttpActionResult GetAll()
        {
            string result;
            try
            {
                result = PollService.AllUsers;
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }

            return new RawJsonContent(result);
        }
    }
}
