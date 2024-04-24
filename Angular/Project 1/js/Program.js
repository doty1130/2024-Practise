

var WalletAddress = [];
var WalletName = [];

document.addEventListener("DOMContentLoaded", function() {    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.coingecko.com/api/v3/ping", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById("serverCheck").innerHTML = "Server is Online.";
        } else {
            document.getElementById("serverCheck").innerHTML = "Waiting for Server.";
        }
    };
    xhr.send();
});

function displayBitcoinInfo() {
    var xhr = new XMLHttpRequest();
    var url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=true&precision=15";
    
    var coinData;
    
    xhr.open("GET", url, false); 
    xhr.send();
    if (xhr.status === 200) {
        var coinData = JSON.parse(xhr.responseText);
        console.log(coinData);

        // Build HTML string
        var html = "<h2>Bitcoin Information</h2>";
        html += "<p>Price (USD): " + coinData.bitcoin.usd + "</p>";
        var lastUpdatedDate = new Date(coinData.bitcoin.last_updated_at * 1000); // Convert timestamp to date
        html += "<p>Last Updated At: " + lastUpdatedDate.toLocaleString() + "</p>";

        return html;
    } else {
        console.log("Look Here response: " + xhr.responseText);
        return "Sorry Data is not avaible";
    }
   
}

function displayWalletBalance(data, walletName)
{
    var walletInfo = data;
    var walletObject = document.getElementById("walletObject");
    walletObject.innerHTML += "<p> Current Balance in "+ walletName +" : " + walletInfo.balance +"</P>";
}

function showInputForm()
{
    var form = document.getElementById("WalletForm");
    if(form.style.display === "none")
        form.style.display = "block";
    else
        form.style.display= "none";
    
}

var coinApp = angular.module("myCoinApp", []);

coinApp.directive("coinInformation", function() {
    return {
        restrict: 'E',
        template: "<div>" + displayBitcoinInfo() + "</div>"
    };
});

coinApp.directive("marketChart", ["$http", "$q", function($http, $q) {
    return {
        restrict: 'E',
        scope: {
            data: '<'
        },
        template: '<div id="chart_div"></div>',
        link: function(scope, element, attrs) {
            // Function to load Google Charts library synchronously
            function loadGoogleCharts() {
                var deferred = $q.defer();
                google.charts.load('current', { packages: ['corechart', 'line'] });
                google.charts.setOnLoadCallback(function() {
                    deferred.resolve();
                });
                return deferred.promise;
            }

            // Function to fetch data synchronously
            function fetchData() {
                var deferred = $q.defer();
                var url = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=10&precision=full";

                $http.get(url)
                    .then(function(response) {
                        // Successful response
                        deferred.resolve(response.data);
                    })
                    .catch(function(error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            }

            // Load Google Charts library and fetch data synchronously
            loadGoogleCharts()
                .then(fetchData)
                .then(function(data) {
                    // Data is now available, render chart
                    renderChart(data);
                    console.log("From api call");
                    console.log(data);
                })
                .catch(function(error) {
                    console.log("Error loading data or chart", error);
                });

            // Function to render the chart
            function renderChart(data) {
                var pricesData = [['Time', 'Price']];
                data.prices.forEach(function(price) {
                    pricesData.push([new Date(price[0]), price[1]]);
                });

                var options = {
                    title: 'Cryptocurrency Prices',
                    curveType: 'function',
                    legend: { position: 'bottom' }
                };

                var chartData = google.visualization.arrayToDataTable(pricesData);
                var chart = new google.visualization.LineChart(element[0]);
                chart.draw(chartData, options);
            }
        }
    };
}]);




var walletName;
var walletAddress;

function livelyPropertyListener(name, val)
{
  switch(name) {
    case "Wallet Name":
      walletName = val;
      break;
    case "Wallet Address":
      walletAddress = val;
      break;
    case "Submit":
        var event = new Event('submit');
        loadWallet(event, walletName, walletAddress);
      break;
  }
};

document.getElementById('submitButton').addEventListener('click', function() {
    livelyPropertyListener("Submit");
}); 

function loadWallet(event, walletName, walletAddress) {
    event.preventDefault(); // Prevent default form submission
    

    if (walletName == "optionalWalletName") {
        WalletAddress.push(document.getElementById("walletAddress").value);
        WalletName.push(document.getElementById("walletName").value);
    } else {
        WalletAddress.push(walletAddress);
        WalletName.push(walletName);
    }

    var postresult = document.getElementById("walletObject");
    postresult.innerHTML = ""; // Clear previous content
    for (var i = 0; i < WalletName.length; i++) {
        (function(index) {
            var xhr3 = new XMLHttpRequest();
            var url = "https://api.blockcypher.com/v1/btc/main/addrs/" + WalletAddress[index] + "/balance";

            xhr3.open("GET", url, true);
            xhr3.onreadystatechange = function() {
                if (xhr3.readyState === 4) {
                    if (xhr3.status === 200) {
                        var response = JSON.parse(xhr3.responseText);
                        displayWalletBalance(response, WalletName[index]);
                    } else {
                        console.log("HERE LOOKK HEREE for balance failed: " + xhr3.responseText + " : " + response + " Error: Unable to fetch data.");
                    }
                }
            };
            xhr3.send();


            var xhr4 = new XMLHttpRequest();
            var url = "https://api.blockcypher.com/v1/btc/main/addrs/" + WalletAddress[index] + "/full";

            xhr4.open("GET", url, true);
            xhr4.onreadystatechange = function() {
                if (xhr4.readyState === 4) {
                    if (xhr4.status === 200) {
                        var response = JSON.parse(xhr4.responseText);
                        WalletCharts(response,WalletAddress[index]);
                    } else {
                        console.log("HERE LOOKK HEREE for Full Failed: " + xhr4.responseText + " : " + response + " Error: Unable to fetch data.");
                    }
                }
            };
            xhr4.send();
        })(i);
    }
    
    // Clear input fields on the website version
    document.getElementById("walletAddress").value = "";
    document.getElementById("walletName").value = "";
}

function WalletCharts(response, address)
{
    
    let transactions = [];

    for (let i = 0; i < response.txs.length; i++) {
        transactions.push(response.txs[i]);
    }
    console.log(address + "This is your address");
    console.log(transactions[0]);
    
    

    
    
    

};