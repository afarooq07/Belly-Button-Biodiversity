function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}


// 1. Create the buildCharts function.
function buildCharts(sample) {

  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var sampledata = data.samples;

    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var resultArray = sampledata.filter(sampleObj => sampleObj.id == sample);

    //  5. Create a variable that holds the first sample in the array.
    var result = resultArray[0];

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otu_ids = result.otu_ids;
    var otu_labels = result.otu_labels;
    var sample_values = result.sample_values;
    //console.log(sample_values);


    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
    var sortedSamples = resultArray.sort((a,b) => a.sample_values - b.sample_values).reverse();
    var topTenSamplesIds = sortedSamples.map(sample => sample.otu_ids)[0].slice(0,10);
    var topTenSamplesValues = sortedSamples.map(sample => sample.sample_values)[0].slice(0,10);
    var topTenSamplesLabels = sortedSamples.map(sample => sample.otu_labels)[0].slice(0,10);  
    
    var yticks =  topTenSamplesIds.map((id => "OTU " + id));


    // 8. Create the trace for the bar chart. 
    var barData = [{
      x: topTenSamplesValues,
      y: yticks,
      orientation: 'h',
      type: "bar",
      template: "seaborn",
      marker: {
        color: 'rgb(142,124,195)',
        opacity: 0.6,
        line: {
          color: 'rgb(8,48,107)',
          width: 1.5
        }
      },
      hovertemplate: topTenSamplesLabels 
     }];
   
    // 9. Create the layout for the bar chart.     
    var barLayout = {
       plot_bgcolor:'rgb(244, 246, 246)',
       title: "Top 10 Bacteria Cultures Found",
       yaxis: {autorange:'reversed'}  
    };
     
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);

    // 1. Create the trace for the bubble chart.
    var bubbleData = [{
      x: otu_ids,
      y: sample_values,
      mode: 'markers',
      text: topTenSamplesLabels,
      marker: {
        size: sample_values,
        color: otu_ids }
    }];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      plot_bgcolor:'rgb(244, 246, 246)',
      title: "Bacteria Cultures Per Sample",
      xaxis: { title: "OTU ID"},
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout); 

    // 4. Create the trace for the gauge chart.
    var md = data.metadata;
    var metadataArray = md.filter(sampleObj => sampleObj.id == sample);
    var metadataResult = metadataArray[0];
    var wfreqFloat = parseFloat(metadataResult.wfreq);

    //console.log(wfreqFloat);
   
    var gaugeData = [
      {
        value: wfreqFloat,
        title: {text: 'Belly Button Washing Frequency<br>Scrubs per Week'} ,
        // { text: <h1>'Belly Button Washing Frequency' </h1> },
        type: "indicator",
        mode: "gauge+number",
        gauge: {
          axis: { range: [null, 10] },
          bar: { color: "black" },
          steps: [
            { range: [0, 2], color: "red" },
            { range: [2, 4], color: "orange" },
            { range: [4, 6], color: "yellow" },
            { range: [6, 8], color: "lightgreen"},
            { range: [8, 10], color: "green" },
          ],
          threshold: {
            line: { color: "black", width: 4 },
            thickness: 0.75,
            value: 490
          }
        }
      }
    ];

    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
                    //width: 400,
                    //height: 300,
                    margin: { t: 0, b: 0 },
                   // paper_bgcolor: "#F4F6F6",
                   // margin: { t: 25, r: 25, l: 25, b: 25 },
                    font: { color: "darkblue", family: "Arial" }
                  };


    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot('gauge', gaugeData, gaugeLayout);
   
  });

}
