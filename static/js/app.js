//Read in json file
var jsonData = "samples.json"

var dropDown = d3.select("#selDataset"); 
var table = d3.select("#sample-metadata"); 
var barChart = d3.select("#bar"); 
var bubbleChart = d3.select("#bubble"); 

function init() {

  d3.json(jsonData).then(data => {
    
    data.names.forEach(name => {
      var option = dropDown.append("option");
      option.text(name);
      }); //close forEach

   var initId = dropDown.property("value")
   plotCharts(initId); 

  });  
}  

function plotCharts(id) {

  resetHtml(); 

  //demographic info table
  d3.json(jsonData).then(data => {
    var individualMetadata = data.metadata.filter(participant => participant.id == id)
    var metaData = individualMetadata[0]; 

    Object.entries(metaData).forEach(([key, value]) => {
      var list = table.append("ul")
        .attr("class","list-group");
      var item = list.append("li")
        .attr("style", "list-style-type: none");
      item.text(`${key}: ${value}`);
    });

    //filter samples.json 
    var individualSample = data.samples.filter(sample => sample.id == id);
    var sampleData = individualSample[0];

    //Sample trace(x axis)
    var sampleValues = []
      sampleValues.push(sampleData.sample_values);
      var top1Ootusamples = sampleValues[0].slice(0, 10).reverse();
    
    //ID trace (y axis)
    var otuIDs = []
      otuIDs.push(sampleData.otu_ids);
      var top1OotuIDs = otuIDs[0].slice(0, 10).reverse();

    //hover labels
    var otuLabels = []
      otuLabels.push(sampleData.otu_labels);
      var top1OotuLabels = otuLabels[0].slice(0, 10).reverse();

    //Bar Chart  

    var barTrace = {
      x: top1Ootusamples,
      y: top1OotuIDs.map(otu => `OTU ${otu}`),
      type: "bar",
      orientation: "h", 
      text: top1OotuLabels 
    }; 

    var layout = {
      height: 650,
      width: 450
    }

    var barData = [barTrace];

    Plotly.newPlot("bar",barData, layout);
  
    //Bubble Chart
    var bubbleTrace = {
      x: otuIDs[0],
      y: sampleValues[0],
      text: otuLabels[0], 
      mode: 'markers',
        marker: {
          size: sampleValues[0], 
          color: otuIDs[0] 
        }
    }; 

    var layout = {
      xaxis: {
        title: "OTU ID",
        autotick: false,
        dtick: "500"
      },
      showlegend: false,
      height: 600,
      width: 1200
    };

    var bubbleData = [bubbleTrace];

    Plotly.newPlot("bubble",bubbleData, layout);

    //Gauge

    var wfreq = metaData.wfreq;

    if (wfreq == null) {
      wfreq = 0;
    }

    
    var traceGauge = {
        
        value: wfreq,
        type: "indicator",
        mode: "gauge",
        gauge: {
            axis: {
                range: [0, 9],
                tickmode: 'linear',
                tickfont: {
                    size: 22
                }
            },
            bar: { color: 'rgba(8,29,88,0)' }, 
            steps: [
                { range: [0, 1], color: 'rgb(243,244,224)' }, 
                { range: [1, 2], color: 'rgb(238,240,218)' },
                { range: [2, 3], color: 'rgb(228,230,201)' },
                { range: [3, 4], color: 'rgb(238,243,186)' },
                { range: [4, 5], color: 'rgb(220,238,184)' },
                { range: [5, 6], color: 'rgb(192,209,156)' },
                { range: [6, 7], color: 'rgb(169,215,156)' },
                { range: [7, 8], color: 'rgb(144,188,149)' },
                { range: [8, 9], color: 'rgb(108,156,114)' }
            ]
        }
    };

    // angle for each segment on the chart
    var angle = (wfreq / 9) * 180; 

    // end points for triangle pointer path
    var degrees = 180 - angle,
        radius = .75;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path to create needle shape
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        cX = String(x),
        cY = String(y),
        pathEnd = ' Z';
    var path = mainPath + cX + " " + cY + pathEnd;

    // draw circle where the needle is centered
    var needleCenter = {
        x: [0],
        y: [0],
        marker: {
          size: 15,
          color: '850000'
      }
    };

    var dataGauge = [traceGauge, needleCenter];

    var layout = {
        
        shapes: [{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000',
                width: 7
            }
        }],
        title: {
            text: `<b>Belly Button Washing Frequency</b><br>Scrubs per Week`,
            font: {
                size: 20
            },
        },
        height: 500,
        width: 500,
        xaxis: {
            zeroline: false,
            showticklabels: false,
            showgrid: false,
            range: [-1, 1],
            fixedrange: true
        },
        yaxis: {
            zeroline: false,
            showticklabels: false,
            showgrid: false,
            range: [-0.5, 1.5],
            fixedrange: true
        }
    };

    Plotly.newPlot('gauge', dataGauge, layout);

  }); 

} 

function resetHtml() {
  table.html("");
}

function optionChanged(id) {
  plotCharts(id); 
}

init();


