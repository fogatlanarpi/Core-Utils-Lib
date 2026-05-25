namespace Flights_Console
{
    internal class Program
    {
        static void Main(string[] args)
        {
            List<Airline> airlines = new List<Airline>();
            List<Flight> flights = new List<Flight>();
            try
            {
                airlines = Airline.LoadFromJson();
            }
            catch
            {
                Console.WriteLine("A légitársaságok beolvasása sikertelen");
            }
            try
            {
                flights = Flight.LoadFromJson();
            }
            catch
            {
                Console.WriteLine("A járatok beolvasása sikertelen");
            }

            if (airlines.Count == 0 || flights.Count == 0)
            {
                return;
            }
            Console.WriteLine("A fálok beolvasása sikeres");

            Console.Write("6. feladat: Kérem adja meg a max időt órában: ");
            float hours = 0;
            float.TryParse(Console.ReadLine().Replace('.', ','), out hours);
            while (hours < 0)
            {
                Console.Write("Hibás érték! Kérjük adjon meg 0-nál nagyobb számot! ");
                float.TryParse(Console.ReadLine().Replace('.', ','), out hours);
            }

            flights.Where(f => f.flight_duration <= hours).ToList().ForEach(f =>
            {
                Console.WriteLine($"\t{f.destination} - {f.flight_duration} ({f.date:yyyy.MM.dd HH:mm})");
            });

            foreach( var al in airlines)
            {
                var fl = flights.Where(f => f.airline_id == al.id).OrderBy(f => f.date).ToList();

                int maxIndex = 0;
                double maxMinutes = 0;
                for(var i = 0; i < fl.Count - 1; i++)
                {
                    if ((fl[i+1].date - fl[i].date).TotalMinutes > maxMinutes )
                    {
                        maxIndex = i;
                        maxMinutes = (fl[i + 1].date - fl[i].date).TotalMinutes;
                    }
                }
                Console.WriteLine($"\t{al.name}: {maxMinutes / 60:f0} óra");
            }
        }
    }
}
