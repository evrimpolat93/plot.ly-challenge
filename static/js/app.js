json_path = "samples.json"

function init() {
    dataBar = [{
        // values
        x: [5, 6, 7, 8],
        // labels
        y: ["A", "B", "C", "D"],
        // texthover
        text: ['A', 'B', 'C', 'D'],
        type: "bar",
        orientation: "h",
        marker: {
            color: 'rgb(142,124,195)'
        }
    }];
    layoutBar = {
        title: "<b>Top 10 OTUs found for this id</b>"
    }

    Plotly.newPlot("bar", dataBar, layoutBar);
    // -----------------------------------------
    bubbleData = [{
        x: [1, 2, 3, 4],
        y: [10, 11, 12, 13],
        mode: 'markers',
        text: ['A', 'B', 'C', 'D'],
        marker: {
            color: ['rgb(93, 164, 214)', 'rgb(255, 144, 14)', 'rgb(44, 160, 101)', 'rgb(255, 65, 54)'],
            // opacity: [1, 0.8, 0.6, 0.4],
            size: [40, 60, 80, 100]
        }
    }];
    var layoutBubble = {
        title: '<b>OTU Ids To Sample Values </b>',
        xaxis: { title: "OTU Ids" },
        yaxis: { title: "Sample Values" }
        // showlegend: false,
        // height: 600,
        // width: 600
    };
    Plotly.newPlot("bubble", bubbleData, layoutBubble)
    // ----------------------------------------------------------

};

// select id that will work on it 
listId = d3.selectAll("#selDataset")

listId.on("click", function getData() {
    // option list to push values to it 
    let optionList = document.getElementById('selDataset').options;

    d3.json(json_path).then(function (data) {
        // samples key in json
        sample = data.samples
        metadata1 = data.metadata
        // loop through and add the id to option 
        sample.forEach(value => optionList.add(new Option(value.id)));

    });

});

d3.select("#selDataset").on("change", updatePage);
d3.select("#sample-metadata").on("change", updatePage)
// bar chart data 
function updatePage() {
    // Use D3 to select the dropdown menu
    var dropdownMenu = d3.selectAll("#selDataset").node();
    // Assign the dropdown menu option to a variable
    let selectedOption = dropdownMenu.value;
    // console.log(selectedOption);
    // filter data from the user 
    otuIdsFilter = sample.filter(row => row.id === selectedOption)[0];

    // label chart and convert it to string 
    arrayOtu = otuIdsFilter.otu_ids;
    y = arrayOtu.slice(0, 10).map(yy => "OTU " + yy.toString()).reverse();

    // values in x asis 
    arraySample = otuIdsFilter.sample_values;
    x = arraySample.slice(0, 10).reverse();

    // texthover 
    arrayText = otuIdsFilter.otu_labels;
    text = arrayText.slice(0, 10).reverse();

    // update the bar plot data 
    Plotly.restyle("bar", "x", [x]);
    Plotly.restyle("bar", "y", [y]);
    Plotly.restyle("bar", "text", [text]);

    // update bubble chart data
    Plotly.restyle("bubble", "x", [arrayOtu])
    Plotly.restyle("bubble", "y", [arraySample]);
    Plotly.restyle("bubble", "marker.size", [arraySample])
    Plotly.restyle("bubble", "marker.color", [arrayOtu])
    Plotly.restyle("bubble", "text", [arrayText])



    d3.json(json_path).then(function (data) {
        metadata1 = data.metadata

        console.log("metadata1", metadata1)
        console.log(selectedOption);

        metadataFilter = metadata1.filter(row => row.id === parseInt(selectedOption))[0];
        console.log("metadataFilter", metadataFilter)

        // console.log("metadataFilter",Object.keys(metadataFilter).length)
        let para = ""
        for (var key in metadataFilter) {
            para += key + ": " + metadataFilter[key] + "<br>"

        };

        // console.log(para);
        d3.select("#sample-metadata").node().innerHTML = para;

        washingFreq = metadataFilter.wfreq
        console.log(washingFreq)
        // update guage chart data
        var level = washingFreq;

        // Trig to calc meter point
        var degrees = 9 - level;
        // pointer lenght 
        radius = .5;
        var radians = degrees * Math.PI / 9;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);

        // Path: may have to change to create a better triangle
        var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
        var path = mainPath.concat(pathX, space, pathY, pathEnd);

        var gaugeData = [{
            // pointer Spot place 
            type: 'scatter',
            x: [0], y: [0],
            marker: { size: 10, color: '850000' },
            showlegend: false,
            text: level,
            name: "times",
            // infomation on the scatter spot
            hoverinfo: 'text+name'
        },
        {
            // pie divied on 50 on 9 items because we want just half pie
            values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],

            rotation: 90,
            // text on the sections
            text: ['0-1', '1-2', '2-3', '3-4',
                '4-5', '5-6', '6-7', '7-8', '8-9'],
            direction: 'clockwise',

            textinfo: 'text',
            textposition: 'side',
            marker: {
                colors: ['#FF00FF', '#DA70D6',
                    '#C71585', '#DB7093',
                    '#FF1493', '#FF69B4	',
                    // put 50 half of pie white color
                    '#FFB6C1	', '#FFC0CB	', '#FAEBD7	', 'white'],
                labels: ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9'],
                // hoverinfo: 'label'


            },
            hoverinfo: 'label',
            hole: .5,
            type: 'pie',
            showlegend: false
        }];
        var gaugelayout = {
            shapes: [{
                // tringel formate 
                type: 'path',
                path: path,
                fillcolor: '850000',
                line: {
                    color: '850000'
                }
            }],
            title: '<b>Belly Button Washing Frequancy</b> <br> Scrups per week',
            // height: 1000,
            // width: 1000,
            xaxis: {
                // disapeare x accordinater 
                zeroline: false, showticklabels: false,
                showgrid: false, range: [-1, 1]
            },
            yaxis: {
                zeroline: false, showticklabels: false,
                showgrid: false, range: [-1, 1]
            }


        }

        // var gaugeLayout = { width: 600, height: 400 };
        Plotly.newPlot('gauge', gaugeData, gaugelayout);

    });


};


init();
