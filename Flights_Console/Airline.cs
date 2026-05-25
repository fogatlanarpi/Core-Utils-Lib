using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;

namespace Flights_Console
{
    public class Airline
    {
        public int id { get; set; }
        public string name { get; set; }

        public static List<Airline> LoadFromJson(string fileName = "airlines.json")
        {
            var jsonContent = File.ReadAllText(fileName/*, Encoding.UTF8*/);
            return JsonSerializer.Deserialize<List<Airline>>(jsonContent) ?? new List<Airline>();
        }

    }
}
