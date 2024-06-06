
var walletInfo;
var walletName;
var walletAddress;
var WalletData = [];
var WalletName;
var WalletAddress;
var ChartWallet;
var walletBalances = [];
var Wallet = [];

document.addEventListener("DOMContentLoaded", function(){
    LoadServerCheck();
});

setInterval(function (){
    console.log("Page Reloaded");
    window.location.reload;

}, 63000);

function LoadServerCheck() {    
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
};

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
        var html = "<div class='coin-Information-Style'><h2>Bitcoin Information</h2>";
        html += "<p>Price (USD): " + coinData.bitcoin.usd + "</p>";
        var lastUpdatedDate = new Date(coinData.bitcoin.last_updated_at * 1000); // Convert timestamp to date
        html += "<p>Last Updated At: " + lastUpdatedDate.toLocaleString() + "</p> </div>";

        return html;
    } else {
        console.log("Look Here response: " + xhr.responseText);
        return "Sorry Data is not avaible";
    }
   
}

function displayWalletBalance(data, walletName) {
    walletInfo = data;
    var walletObject = document.getElementById("walletObject");
    walletObject =+ '<p>Found Wallet '+walletName+'<p>';
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
                    legend: { position: 'bottom' },
                    //width:1600
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
            console.log("Found Default Wallet Name");
            WalletAddress = document.getElementById("walletAddress").value;
            WalletName = document.getElementById("walletName").value;
        } else {
            WalletAddress = walletAddress;
            WalletName = walletName;
        }

        var postresult = document.getElementById("walletObject");
        postresult.innerHTML = ""; // Clear previous content
        var balance;
        
        var xhr3 = new XMLHttpRequest();
        var url = "https://api.blockcypher.com/v1/btc/main/addrs/" + WalletAddress + "/balance";
        

        xhr3.open("GET", url, false);
        xhr3.onreadystatechange = function() {
            if (xhr3.readyState === 4) {
                if (xhr3.status === 200) {
                    var response = JSON.parse(xhr3.responseText);
                    balance = response.balance;
                    walletBalances.push(balance);
                    displayWalletBalance(response, WalletName);
                } else {
                    console.log("HERE LOOKK HEREE for balance failed: " + xhr3.responseText + " : " + response + " Error: Unable to fetch data.");
                }
            }
        };
        xhr3.send();


        var xhr4 = new XMLHttpRequest();
        var url = "https://mempool.space/api/address/"+WalletAddress+"/txs/chain";

        xhr4.open("GET", url, false);
        xhr4.onreadystatechange = function() {
            if (xhr4.readyState === 4) {
                if (xhr4.status === 200) {
                    var response = JSON.parse(xhr4.responseText);
                    WalletFormation(response,WalletAddress, WalletName, balance);
                } else {
                    console.log("HERE LOOKK HEREE for Full Failed: " + xhr4.responseText + " : " + response + " Error: Unable to fetch data.");
                }
            }
        };
        xhr4.send();
    
    
    // Clear input fields on the website version
    document.getElementById("walletAddress").value = "";
    document.getElementById("walletName").value = "";
}

function WalletFormation(response, wAddress, wName, balance) { 
    let transactions = [];
    

    for (let i = 0; i < response.length; i++) {
        transactions.push(ProcessResponse(response[i], wAddress));
    }

    var dataPlots = PlotData(transactions, balance);

    Wallet.push([wName, wAddress, dataPlots, false]);
   

    // Create a new div element for each wallet
    let walletDivs = document.getElementById("walletObject");
    
    var addresses = [];
    for(let i = 0; i < Wallet.length; i++)
    {

        console.log("Addresses in use");
        console.log(addresses);
        Wallet[i][3] = false;
        DisplayBalance = (walletBalances[i] == "Undefined")? 0: walletBalances[i];
        if(addresses.includes(Wallet[i][1])){
            console.log("Address is used, skipping extra wallet");
            continue;
        }
        
        walletDivs.innerHTML += `
        <li> 
            <p> Current Balance in ${Wallet[i][0]} : <span id="Balance${i}">${DisplayBalance}</span>
            <span class = "toggle-container">
            <input type="checkbox" id="toggle${i}" onclick="WalletToggle(${i})">
            <label for="walletToggle${i}">Toggle</label>
            </span></p> 
        </li>`;

        console.log("adding address to count");
        addresses.push(Wallet[i][1])
    };
    
}

// Use this function to toggle the display of a wallet on the graph
function WalletToggle(WalletIndex){
    Wallet[WalletIndex][3] = !Wallet[WalletIndex][3];
    WalletChart();

}

// user this function to display the graph with wallet information.
function WalletChart()
{
    //console.log(Wallet);
    // Prepare data for Google Charts

    const chart = new google.visualization.LineChart(document.getElementById('chart-container'));
const options = {
    title: 'Wallet Data',
    legend: { position: 'bottom' },
    colors: ['#FF5733', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#E91E63', '#00BCD4', '#FF9800', '#8BC34A', '#795548'],
    height: 250
    // Add more options as needed
};
var plotPoints = [];
var currentIndex = 0;
var headers = ['date'];
var MakeChart = false;
Wallet.forEach((wallet, outerIndex) => {

    if (wallet[3]) {
        headers.push(wallet[0]);
        let data = wallet[2];
        MakeChart = true;
        data.forEach((datum) => {
            let date = datum[0];
            let balance = datum[1];

            // Check if the date is already present in plotPoints
            let existingDataIndex = plotPoints.findIndex(item => item[0] === date);

            if (existingDataIndex !== -1) {
                // If date already exists, update the balance for the corresponding outerIndex
                plotPoints[existingDataIndex][outerIndex + 1] = balance;
            } else {
                // If date doesn't exist, create a new entry with null values for other datasets
                let newEntry = Array(headers.length).fill(null); // Use headers.length to match current dataset size
                newEntry[0] = date;
                newEntry[outerIndex + 1] = balance; // outerIndex + 1 to match headers index
                plotPoints.push(newEntry);
            }
        });
    }
});

// Sort plotPoints array by date
plotPoints.sort(sortByDate);

// Add header for date and each balance




/* console.log(plotPoints);
console.log(headers);
console.log(" After processing; plot points & header"); */


if(MakeChart)
{
plotPoints = cleanPlotsSet1(plotPoints, headers);
plotPoints = cleanPlotsSet2(plotPoints, headers);
plotPoints.unshift(headers);
}


console.log(plotPoints);
console.log("Check Cleaned Points");

var chartData = google.visualization.arrayToDataTable(plotPoints); 
try {
 
    // Draw the chart
    if(MakeChart){   
        console.log("Show Chart");
        document.getElementById('chart-container').style.display = "block";
        chart.draw(chartData, options);
     }
    else{ 
        console.log("hide Chart");
        document.getElementById('chart-container').style.display = "none";}
       

} catch (error) {
    console.error('Error adding rows to DataTable:', error);
}
}
function sortByDate(a, b)
{
    let dateA = new Date(a[0]);
    let dateB = new Date(b[0]);
    return dateA - dateB;
}

function getTodaysDate() {
    let date = new Date();
    let year = date.getFullYear();
    let month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
    let day = ('0' + date.getDate()).slice(-2);
    let hour = ('0' + date.getHours()).slice(-2);

    let formattedDate = `${year}-${month}-${day} ${hour}:00:00`;

    return formattedDate;
}

function convertTime(time) {
    let milliseconds = time * 1000;
    let date = new Date(milliseconds);

    let year = date.getFullYear();
    let month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
    let day = ('0' + date.getDate()).slice(-2);
    let hour = ('0' + date.getHours()).slice(-2);

    let formattedDate = `${year}-${month}-${day} ${hour}:00:00`;

    return formattedDate;
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

    plotPoints.reverse();
   // plotPoints.splice(0,0,['Date','Balance']);
    return plotPoints;

};

// Removes full nulls.
function cleanPlotsSet1(plotPoints, headers) {
    
    //Edge Case: Empty Set
    if(plotPoints[0].length <= 1)
        {
            return plotPoints;
        }
    
    let row = plotPoints.length;
    let col = plotPoints[0].length;

    // Edge case: if plotPoints don't need cleaning
    let colCheck = headers.length;
    if (col == colCheck) {
        console.log("Points work, returning.");
        return plotPoints;
        
    }


    let delColumns = [];

    // look at column 
    for (let c = 0; c < col; c++) {
        let isNullColumn = true;

        // Check rows in column for null.
        for (let r = 1; r < row; r++) {
            if (plotPoints[r][c] !== null) {
                isNullColumn = false;
                break;
            }
        }

        if (isNullColumn) {
            delColumns.push(c);
            console.log("Added c to deColumes" + c);
        }
    }

    // Remove the columns that are exclusively null
    delColumns.forEach((column) => {
        for (let r = 0; r < row; r++) {
            plotPoints[r].splice(column, 1);
        }
    });
   


    return plotPoints;
}

// fills nulls where appropreite.
function cleanPlotsSet2(plotPoints, headers)
{
    let col = headers.length;
    
    for (let c = 0; c < plotPoints.length; c++) {
           while (plotPoints[c].length < col) {
               plotPoints[c].push(null);
            }
       }
    
    console.log(plotPoints);
    return plotPoints;
} 

// Needs to add date Range to data scrub