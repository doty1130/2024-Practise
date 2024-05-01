

var WalletAddress = [];
var WalletName = [];
var walletName;
var walletAddress;

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
    walletObject.innerHTML += '<p> Current Balance in '+ walletName +' : <p id = "balance">'+ walletInfo.balance +'</p> </p>';
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
        link: function(scope,element) {
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

coinApp.directive("mempoolStats", ["$http", "$q","$compile", function($http, $q, $compile){
    return {
        restrict: 'E',
        scope: {
            data: '<'
        },
        template: '<div id="mempoolStats"></div>',
        link: function(scope, element) {
        
            var htmlTemplate = '<p>Mempool Stats: sat/vB {{mempoolData.total_fee/mempoolData.vsize}}</p>' +
            '<p>Transactions: {{ mempoolData.count }}</p>' +
            '<p>Size: {{ mempoolData.vsize }} bytes</p>' +
            '<p>Fee Rate: Fastest {{ feeRecommendation.fastestFee }}, Half Hour Fee {{ feeRecommendation.halfHourFee}}, Hour Fee {{feeRecommendation.hourFee}}, Economy Fee {{ feeRecommendation.economyFee}}, Minimum Fee {{feeRecommendation.minimumFee}} </p>';
       
            function getMempool(){
                var deferred = $q.defer();
                var url = "https://mempool.space/api/mempool";
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
            
            function getFeeRecommendation(){
                var deferred = $q.defer();
                var url = "https://mempool.space/api/v1/fees/recommended";
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

            $q.all([getMempool(), getFeeRecommendation()])
            .then(function(results) {
               
                console.log(results[0]);
                console.log(results[1]);
                scope.mempoolData = results[0]; // Data from getMempool
                scope.feeRecommendation = results[1]; // Data from getFeeRecommendation

                element.html(htmlTemplate);
                // Compile the HTML to bind AngularJS expressions
                $compile(element.contents())(scope);
            })
            .catch(function(error) {
                console.error('Error fetching data:', error);
            });
        }
    }
}]);

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
            
            xhr3.open("GET", url, false);
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
            var url = "https://mempool.space/api/address/"+WalletAddress[index]+"/txs/chain";

            xhr4.open("GET", url, false);
            xhr4.onreadystatechange = function() {
                if (xhr4.readyState === 4) {
                    if (xhr4.status === 200) {
                        var response = JSON.parse(xhr4.responseText);
                        WalletCharts(response,WalletAddress[index], walletName[index]);
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

function WalletCharts(response, wAddress, wName)
{
    let transactions = [];
    let balance = parseFloat(document.getElementById("balance").innerHTML);
    //Cleaned Data
    for (let i = 0; i < response.length; i++) {
        transactions.push(ProcessResponse(response[i], wAddress));
    }

    var dataPlots = [];
    let startingDate = getTodaysDate();

    dataPlots = PlotData(transactions, balance);
    dataPlots.reverse();


    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        // Assuming dataPlots is in the format [['Date', 'Balance'], [date1, balance1], [date2, balance2], ...]

        var data = google.visualization.arrayToDataTable(dataPlots);

        var options = {
            title: 'Transaction History',
            curveType: 'function',
            legend: { position: 'bottom' }
        };

        var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

        chart.draw(data, options);
    }
 
}

function ProcessResponse(response, address) {
    // Cleaning Data from api call.

    var dataMap = {
        'Tfee' : response.fee,
        'Tsigops' : response.sigops,
        'Tsize' : response.size,
        'Tdate' : convertTime(response.status.block_time),
        'Tinputs' : [],
        'addToTinputs': function(item){this.Tinputs.push(item);},
        'TinputsAmounts' : [],
        'addToTinputsAmounts': function(item){this.TinputsAmounts.push(item);},
        'Toutputs' : [],
        'addToToutputs': function(item){this.Toutputs.push(item);},
        'ToutputsAmounts' : [],
        'addToToutputsAmounts': function(item){this.ToutputsAmounts.push(item);}
    };

    for (var i = 0; i < response.vin.length; i++) {
        if(response.vin[i].prevout.scriptpubkey_address == address){
        dataMap.addToTinputs(response.vin[i].prevout.scriptpubkey_address);
        dataMap.addToTinputsAmounts(response.vin[i].prevout.value);
        }
    }

    for (var i = 0; i < response.vout.length; i++) {
      if(response.vout[i].scriptpubkey_address == address){
        dataMap.addToToutputs(response.vout[i].scriptpubkey_address);
        dataMap.addToToutputsAmounts(response.vout[i].value);
        }
    }

    // Return the mapped data point
    return dataMap;
}

function getTodaysDate()
{
    let date = new Date();
    let year = date.getFullYear();
    let month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
    let day = ('0' + date.getDate()).slice(-2);
    let hours = ('0' + date.getHours()).slice(-2);
    let minutes = ('0' + date.getMinutes()).slice(-2);
    let seconds = ('0' + date.getSeconds()).slice(-2);

    let formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
}

function convertTime(time)
{

    
    let milliseconds = time * 1000;
    let date = new Date(milliseconds);

    let year = date.getFullYear();
    let month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
    let day = ('0' + date.getDate()).slice(-2);
    let hours = ('0' + date.getHours()).slice(-2);
    let minutes = ('0' + date.getMinutes()).slice(-2);
    let seconds = ('0' + date.getSeconds()).slice(-2);

    let formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
}

function PlotData(dataMapArray, balance) {
    // Define an array to store the plot points
    var plotPoints = [];
   
    plotPoints.push([getTodaysDate(),balance]);
    var runningBalance = balance;

    // Iterate over each dataMap object
    dataMapArray.forEach(function(datum) {
        // Initialize variables to track input and output amounts
        var i = 0;
        var o = 0;

        // Calculate input amount
        datum.TinputsAmounts.forEach(function(y) {
            i += y; // add all incoming 
        });

        // Calculate output amountS
        datum.ToutputsAmounts.forEach(function(y) {
            o += y; // add all outgoing 
        });

        // Calculate the total moved amount
        var totalMoved = i - o;
        runningBalance += totalMoved;
        // Create a data point [date, amount]
        // The amount is the current balance adjusted by the total moved (in or out) amount
        var dataPoint = [datum.Tdate, runningBalance];

        // Push the data point to the plotPoints array
        plotPoints.push(dataPoint);

        
     
    });
    plotPoints.push(['Date','Balance']);
    return plotPoints;

};

