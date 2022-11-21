window.onload(doughnutchart(),lineChart(2022))


function doughnutchart() {
  if ($("#doughnutChart").length) {
    $.ajax({
      url: "doughnutChart",
      success: (response) => {
        const data = {
          labels: response.name,
          datasets: [
            {
              label: "My First Dataset",
              data: response.value,
              backgroundColor: [
                "rgb(255, 99, 132)",
                "rgb(54, 162, 235)",
                "rgb(255, 205, 86)",
              ],
              hoverOffset: 4,
            },
          ],
        };

        const config = {
          type: "doughnut",
          data: data,
        };

        const myChart = new Chart(
          document.getElementById("doughnutChart"),
          config
        );
      },
    });
  }
};

function lineChart() {
  
  let year= document.getElementById('inputYear').value
  if ($("#lineChart").length) {
    $.ajax({
      url: "lineChart",
      method: "post",
      data: {
        year: year,
      },
      success: (response) => {
        
        const labels = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const data = {
          labels: labels,
          datasets: [
            {
              label: "2022",
              data: response.graphData,
              fill: false,
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            }
          ],
        };

        const config = {
          type: "line",
          data: data,
        };

        $("#lineChart").remove();
        $("div.parentdiv").append('<canvas id="lineChart"></canvas>');
        

        const myChart = new Chart(document.getElementById("lineChart"), config);

        
      },
    });
  }
}
  
