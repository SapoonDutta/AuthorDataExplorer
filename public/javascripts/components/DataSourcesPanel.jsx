var jQuery = require('jquery');
var React = require('react');
var request = require('superagent');

/*Bootstrap stuff*/
var bootstrap = require('bootstrap');
var Button = require('react-bootstrap').Button,
    Panel = require('react-bootstrap').Alert,
    Modal = require('react-bootstrap').Modal,
    Input = require('react-bootstrap').Input;
    Glyphicon = require('react-bootstrap').Glyphicon;

/*Other external components*/
var Dropzone = require('react-dropzone'),   //Drag-drop files
    Highlight = require('react-highlight'); //Syntax highlighting



    var DataSources = React.createClass({

        render: function(){
            var self = this;
            var Sources = self.props.dataSources.map(function(dataSource){
                return(

                    <div style={{border: 1, borderStyle: "dashed", padding: 10, margin: 10}} className="col-md-3 dataSourceSnap"> 
                        sourceName: {dataSource.name}

                    </div>
                );
            })
            return(
                <div className="row">{Sources}</div>
            );
        }
    });

    var DataSourcesPanel = React.createClass({

    	getInitialState(){
    		return { 
                showModal: false, 
                files:[], 
                dataSources: [], 
                sourceName: "", 
                sourceType: "csvFile", 
                options: {}, 
                showDataSourceConfig:false,
                dataSourceConfig: {
                    "dataSourceAlias": "",
                    "dataSources": []
                }
            };
    	},

        close(){
            this.setState({ showModal: false });
        },
    	add(){
    		this.setState({ showModal: false });
            var sourceName = this.state.sourceName;
            var sourceType = this.state.sourceType;
            var options = this.state.files[0].name;
            var dataSources = this.state.dataSources,
                dataSourceConfig = this.state.dataSourceConfig;

            var path = "data/"+options;
            dataSourceConfig["dataSources"].push({
                "sourceName": this.state.sourceName,
                "sourceType": this.state.sourceType,
                "options":{
                    "path": path
                }
            });
            dataSources.push({"name": sourceName, sourceType: sourceType, "options": options })
            console.log(dataSources)
            this.setState({dataSources: dataSources});

    	},

    	open(){
    		this.setState({ showModal: true });
    	},
        handleChange: function(field, e){
            var nextState = {}
            nextState[field] = e.target.checked;
            this.setState(nextState)
        },
        addDataSource: function(){

        },
        selectType: function(event){

            console.log("setting file")
            this.setState({sourceType: event.target.value});

        	//this.setState({sourceType: "file"});
        },
        handleSourceName: function(event){
            this.setState({sourceName: event.target.value});

        },  
        handledataSourceAlias: function(event){
            var dataSourceConfig  = this.state.dataSourceConfig;
            dataSourceConfig["dataSourceAlias"] = event.target.value;
            this.setState({dataSourceAlias: event.target.value, dataSourceConfig: dataSourceConfig})

        },
        onDrop: function(files){
            var dataSourceConfig = this.state.dataSourceConfig;
            var req = request.post('/upload');

            console.log(files);
            var file = files[0];
            console.log(file)
            req.attach(file.name, file)
            req.end(function(){

            	console.log("...");
            }).on('progress', function(e) {
        		console.log('Percentage done: ', e.percent);	
     		});
            console.log('Received files: ', files);

            this.setState({
              files: [file]
            });


        },
        loadData: function(){
            console.log("load dataS")
            var dataSourceConfig = this.state.dataSourceConfig;
            $.get("/loadData?dataSourceConfig="+encodeURIComponent(JSON.stringify(dataSourceConfig)), function(data){
                console.log(data);
            })
        },
        showDataSourceConfig: function(){
            this.setState({showDataSourceConfig: true});
        },
        dontShowDataSourceConfig: function(){

            this.setState({showDataSourceConfig: false});
        },
        render: function(){
            var self = this;
            var fileName = "";
            if(self.state.files){
                var filesComponent = self.state.files.map(function(file){
                    fileName = "data/"+file.name;
                    return(
                        <div style={{padding:12}}>
                            Uploaded: {file.name}
                        </div>
                    );
                })  
            }

            return(
                <div className="col-md-6">
                    <Panel id="dataSourcesPanel">
                        <h3>Data sources</h3>
                        <Input type='text' onChange={this.handledataSourceAlias} label='Data Source Alias' labelClassName='col-xs-3' wrapperClassName='col-xs-6' />
                        <br /><br />

                        <Button bsStyle='success' onClick={this.open}><Glyphicon glyph='glyphicon plus' /> Add</Button>
                        <DataSources dataSources={self.state.dataSources}/>
                        <br />
                        {this.state.dataSources.length ? <div>
                        <Button bsStyle='primary' onClick={this.loadData}>Load Data</Button>
                        <Button bsStyle='default' onClick={this.showDataSourceConfig}>dataSource.json</Button></div> : <div></div> }
                    </Panel>

    			        <Modal show={self.state.showModal} onHide={this.close}>
    			          <Modal.Header closeButton>
    			            <Modal.Title>Add Data Source</Modal.Title>
    			          </Modal.Header>
    			          <Modal.Body>
    			            <form className='form-horizontal' encType="multipart/form-data" >
    					    	<Input type='text' onChange={this.handleSourceName} label='sourceName' labelClassName='col-xs-2' wrapperClassName='col-xs-10' />
    						    <Input type='select' onChange={this.selectType} value={this.sourceType} label='sourceType' placeholder='select'  labelClassName='col-xs-2' wrapperClassName='col-xs-10' >
    						      <option value='csvFile'>CSV File</option>
    						      <option value='jsonFile'>JSON File</option>
                                  <option value='csvREST'>CSV REST</option>
                                  <option value='jsonREST'>JSON REST</option>
                                  <option value='odbc'>ODBC</option>
                                  
    						    </Input>
    						   	<Dropzone ref="dropzone" onDrop={self.onDrop} size={150} style={{margin: 10, border:1, borderColor: "grey", borderStyle: "dashed", width:500}} >
                  					<div style={{padding: "10"}}>Drop file here</div>
                				</Dropzone>

                                {filesComponent}
                                <Input type='text' label='path' labelClassName='col-xs-2' value={fileName} wrapperClassName='col-xs-10' disabled/>

                                <Button bsStyle='success' onClick={this.add}>Add</Button>
    					  	</form>
    			          </Modal.Body>
    			        </Modal>
                        <Modal show={self.state.showDataSourceConfig} onHide={this.dontShowDataSourceConfig}>
                          <Modal.Header closeButton>
                            <Modal.Title>dataSourceConfig.json</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <Highlight className='javascript'>
                                {JSON.stringify(this.state.dataSourceConfig, null, 2)}
                            </Highlight>

                          </Modal.Body>
                        </Modal>
                </div>
            );
        }
    });

module.exports = DataSourcesPanel;