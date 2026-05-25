using System;
using System.Collections.Generic;

namespace Flights_GUI;

public partial class Airline
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Flight> Flights { get; set; } = new List<Flight>();
}
