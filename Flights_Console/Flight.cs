using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Flights_Console
{
    public class Flight
    {
        public int id { get; set; }
        public string destination { get; set; }
        public string gate { get; set; }
        public DateTime date { get; set; }
        public int airline_id { get; set; }
        public float? flight_duration { get; set; }
        public int price { get; set; }

        public static List<Flight> LoadFromJson(string fileName = "flights.json")
        {
            var jsonContent = File.ReadAllText(fileName/*, Encoding.UTF8*/);
            return JsonSerializer.Deserialize<List<Flight>>(jsonContent) ?? new List<Flight>();
        }
    }


    
}
