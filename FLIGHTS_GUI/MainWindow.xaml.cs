using Microsoft.EntityFrameworkCore;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace Flights_GUI
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window, INotifyPropertyChanged
    {

        private FlightsContext context = new FlightsContext();

        private ObservableCollection<Flight>? flights;
        public ObservableCollection<Flight>? Flights
        {
            get { return flights; }
            set { flights = value; OnPropertyChanged(nameof(Flights)); }
        }
        public ObservableCollection<Airline>? Airlines { get; set; }
        public string SearchedDestination { get; set; } = "";
        public Airline? SearchedAirline { get; set; }

        public MainWindow()
        {
            InitializeComponent();
            context.Flights.Load();
            context.Airlines.Load();
            Flights = context.Flights.Local.ToObservableCollection();
            Airlines = context.Airlines.Local.ToObservableCollection();
            Airlines.Insert(0, new Airline() { Id = 0, Name = "" });
            SearchedAirline = Airlines[0];
            this.DataContext = this;
        }

        private void search_BTN_Click(object sender, RoutedEventArgs e)
        {
            Flights = new ObservableCollection<Flight>(context.Flights.Where(x => x.Destination.ToLower().Contains(SearchedDestination.ToLower()) && x.Airline!.Name.Contains(SearchedAirline!.Name)).ToList());
        }


        public event PropertyChangedEventHandler? PropertyChanged;

        public void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}