using System;
using System.Collections.Generic;

namespace Flights_GUI;

public partial class Flight
{
    public int Id { get; set; }

    public string Destination { get; set; } = null!;

    public string Gate { get; set; } = null!;

    public DateTime Date { get; set; }

    public int? AirlineId { get; set; }

    public decimal? FlightDuration { get; set; }

    public string? FlightDurationStr => FlightDuration != null ? FlightDuration.ToString() : "N/A";
    public int Price { get; set; }

    public virtual Airline? Airline { get; set; }
}
