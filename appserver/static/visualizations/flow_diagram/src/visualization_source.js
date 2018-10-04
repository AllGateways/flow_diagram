define([ 'jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/searchmanager',
    'api/SplunkVisualizationBase',
    'api/SplunkVisualizationUtils',
    'jointjs',
    'flow_utils'
    ], 
    function(
        $,
        _,
        mvc,
	SearchManager,
        SplunkVisualizationBase,
        SplunkVisualizationUtils,
        jointjs,
        flow_utils
    ){
        const SPLUNK_DASHBOARD_EDIT_BUTTON = '.btn.edit-btn';
        const SPLUNK_DASHBOARD_UI_BUTTON = '.btn.edit-ui';
        const SPLUNK_DASHBOARD_UI_BUTTON_ACTIVE = '.btn.edit-ui.active';
        const SPLUNK_DASHBOARD_SOURCE_BUTTON = '.btn.edit-source';
        const SPLUNK_DASHBOARD_SOURCE_BUTTON_ACTIVE = '.btn.edit-source.active';
        const SPLUNK_DASHBOARD_SAVE_BUTTON = '.btn.btn-primary.edit-done';
        const SPLUNK_DASHBOARD_SAVE_BUTTON_INACTIVE = SPLUNK_DASHBOARD_SAVE_BUTTON + '.disabled';
        const SPLUNK_DASHBOARD_SAVE_BUTTON_ACTIVE = SPLUNK_DASHBOARD_SAVE_BUTTON + ':not(.disabled)';
        const SPLUNK_DASHBOARD_CANCEL_BUTTON = '.btn.default.edit-cancel';
        const GRIDSIZE = 10;

        var panel_id = null;

        var loaded = false;
        var loading = false;
        var edit_mode = 0;
        var edit_dirty = 0;
        var edit_update = 0;
        var edit_interactive = null;

        var clicked_link = null;
        var graph = null;
        var paper = null;
        var stencilGraph = null;
        var stencilPaper = null;

        var draw_mode = 0;
        var resize_mode = 0;
        var draw_id = 0;
        var start_X = 0;
        var start_Y = 0;

        var search = new SearchManager({
             id: "flow_search",
             cache: false,
             earliest_time: "-1m@m",
             latest_time: "now"
        });

        var update  = new SearchManager({
             id: "flow_update",
             cache: false,
             earliest_time: "-1m@m",
             latest_time: "now"
        });

        $(document).on('click', SPLUNK_DASHBOARD_UI_BUTTON_ACTIVE, function() {
            edit_mode = 1;
            edit_interactive = true;
        });

        $(document).on('click', SPLUNK_DASHBOARD_SOURCE_BUTTON, function() {
            handleEditSource();
            edit_interactive = true;
        });

        $(document).on('click', SPLUNK_DASHBOARD_EDIT_BUTTON, function() {
            //handleEditMode();
            edit_mode == 1;
            edit_interactive = true;
        });

        $(document).on('click', SPLUNK_DASHBOARD_SAVE_BUTTON_ACTIVE, function() {
            handleEditSave();
            edit_interactive = false;
        });

        $(document).on('click', SPLUNK_DASHBOARD_CANCEL_BUTTON, function() {
            handleEditCancel();
            edit_interactive = false;
        });

        return SplunkVisualizationBase.extend({
            initialize: function() {
                this.$el = $(this.el);

                chart = document.createElement("div");
                chart.className = "splunk-flowchart";
                this.el.appendChild(chart);
                edit = document.createElement("div");
                edit.className = "splunk-flowchart-stencil";
                this.el.appendChild(edit);

                initPaper(this.el.getElementsByClassName('splunk-flowchart'));

                initStencilPaper(this.el.getElementsByClassName('splunk-flowchart-stencil'));

	        panel_id = $('.dashboard-cell.dashboard-layout-panel').attr('id');

                if (edit_interactive == null)
                    edit_interactive = false;

                loadDiagram(graph, paper);

		graph.on('add', function(link) {
                    if (link.attributes.type === 'flowchart.Link') {
                        appendLinkLabels(link);
                    }
                    if(edit_mode == 1) {
                        $(SPLUNK_DASHBOARD_SAVE_BUTTON_INACTIVE).removeClass('disabled');
                        edit_dirty = 1;
                    }
                })

                graph.on('change', function () {
                    if(edit_mode == 1 && edit_update != 1) {
                        $(SPLUNK_DASHBOARD_SAVE_BUTTON_INACTIVE).removeClass('disabled');
                        edit_dirty = 1;
                    } else if(edit_mode == 1 && edit_update == 1) {
                        edit_dirty = 0;
                        edit_update = 0;
                    }
                })

/*

                paper.on('blank:pointerdown', function(e) {
                    draw_mode = 1;
                    startX = e.offsetX;
                    startY = e.offsetY;
                });

                paper.on('blank:pointermove', function(e) {
                    if (draw_id == 0) {
                        draw_id = guidGenerator();
                    }
                    endX = e.offsetX;
                    endY = e.offsetY;
                    h = GRIDSIZE * Math.round((endY - startY) / GRIDSIZE);
                    w = GRIDSIZE * Math.round((endX - startX) / GRIDSIZE);
                    
                    if (draw_id != 0) {
                        removeCell(draw_id);
                    }
                    createCell(draw_id, startX, startY, w, h);
                });

                paper.on('blank:pointerup', function(e) {
                    endX = e.offsetX;
                    endY = e.offsetY;
                    w = GRIDSIZE * Math.round((endX - startX) / GRIDSIZE);
                    h = GRIDSIZE * Math.round((endY - startY) / GRIDSIZE);

                    removeCell(draw_id);
                    createCell(draw_id, startX, startY, w, h);
                    draw_mode = 0;
                });
*/


                paper.on('link:pointerclick', function(linkView, evt, x, y) {
                    if(edit_mode == 0)
                        return;

                    if (clicked_link) {
                        removeLinkTool();
                        clicked_link == null;
                    }
                    showLinkTool(linkView);
                });

                paper.on('blank:pointerclick', function(evt, x, y) {
                    if(edit_mode == 0)
                        return;
 
                    removeLinkTool();
                });

                paper.on('element:pointerclick', function(evt, x, y) {
                    if(edit_mode == 0)
                        return;
 
                    //removeLinkTool();
                });


                paper.on('element:pointerdblclick', function(elementView, evt, x, y) {
                    if(edit_mode == 0)
                        return;

                    removeNode(elementView.model);
                });

                /*paper.on('element:mouseenter', function(elementView, evt, x, y) {
                    if(edit_mode == 0)
                        return;

                    elementView.model.attr('border/fill', 'orange');
                    removeLinkTool();
                });

                paper.on('element:mouseup', function(elementView) {
                    if(edit_mode == 0)
                        return;

                    elementView.model.attr('border/fill', '#42b9f4');
                });

                paper.on('element:mouseleave', function(elementView) {
                    if(edit_mode == 0)
                        return;

                    elementView.model.attr('border/fill', '#42b9f4');
                });*/

                paper.on('link:contextmenu', function(linkView, evt, x, y) {
                    if(edit_mode == 0)
                        return;

                    attachLinkFlowId(linkView.model);
                });

	        paper.on('element:contextmenu', function(elemView, evt, x, y) { 
                    if(edit_mode == 0)
                        return;

                    attachElementFlowId(elemView.model);
    	        });

                stencilPaper.on('cell:pointerdown', function(cellView, e, x, y) {
                    createNode(cellView, e, x, y);
                });
            },

            getInitialDataParams: function() {
                return ({
                    outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
                    count: 10000
                });
            },
  
            reflow: function() {
                if (loading == false || edit_dirty == 1) {
                    loadDiagram(graph, paper);
                    this.invalidateReflow();
                }
                if (loading == true && loaded == false) {
                    this.invalidateReflow();
                } else if (loaded == true || loading == false) {
                    loaded = false;
                    loading = false;
                }
            },

            updateView: function(data, config) {
                if (!data || !data.meta) {
                    return;
                }
 
                if (edit_mode == 1) {
                    return;
                }

                if (data.meta.done) {
                    for (i=0; i<data.fields.length; i++) {
                        field = data.fields[i].name;
                        if (field.endsWith('_source')) {
                            field = field.substr(0, field.length - 7);
                            link = getLinkById(field);
                            if (link != null) {
                                value = data.rows[0][i];
                                setLinkSourceValue(link, value);
                            };
                        } else if (field.endsWith('_target')) {
                            field = field.substr(0, field.length - 7);
                            link = getLinkById(field);
                            if (link != null) {
                                value = data.rows[0][i];
                                setLinkTargetValue(link, value);
                            };
                        } else if (field.endsWith('_link')) {
                            field = field.substr(0, field.length - 5);
                            link = getLinkById(field);
                            if (link != null) {
                                value = data.rows[0][i];
                                setLinkValue(link, value);
                            };
                        } else { 
                            element = getElementById(field);
                            if (element != null) {
                                value = data.rows[0][i];
                                setElementValue(element, value);
                            }
                        }
                    }
                }
            }
    });

    function removeCell(fid) {
        if(graph) {
            _.each(graph.getCells(), function(cell) {
                if (cell.attributes['flow-id'] && cell.attributes['flow-id']==fid) {
                      cell.remove();
                }
            })
        }
    }

    function createCell(fid, x, y, w, h) {
        var s = new jointjs.shapes.flowchart.Box({});
        d = 'M ' + x + ' ' + y + ' H ' + (x+w) + ' V ' + (y+h) + ' H ' + x + ' z';
        s.attr('border/d', d);
        s.attr('border/fill', 'none');
        s.attr('border/opacity', '0.2');
        s.attributes['flow-id'] = fid;
        graph.addCell(s);
    }

    function showLinkTool(linkView) {
        var verticesTool = new jointjs.linkTools.Vertices();
        var segmentsTool = new jointjs.linkTools.Segments();
        var sourceArrowheadTool = new jointjs.linkTools.SourceArrowhead();
        var targetArrowheadTool = new jointjs.linkTools.TargetArrowhead();
        var sourceAnchorTool = new jointjs.linkTools.SourceAnchor();
        var targetAnchorTool = new jointjs.linkTools.TargetAnchor();
        var boundaryTool = new jointjs.linkTools.Boundary();
        var removeButton = new jointjs.linkTools.Remove();

        tvs = new jointjs.dia.ToolsView({
            tools: [
                verticesTool,
                segmentsTool,
                sourceArrowheadTool,
                targetArrowheadTool,
                sourceAnchorTool,
                targetAnchorTool,
                boundaryTool,
                removeButton
            ]
        })
        linkView.addTools(tvs);
        linkView.showTools();
        if(clicked_link != null) {
            clicked_link.hideTools();
            clicked_link.removeTools();
            clicked_link = null;
        }
        clicked_link = linkView;
    }

    function removeLinkTool() {
        if(clicked_link != null) {
            clicked_link.hideTools();
            clicked_link.removeTools();
            clicked_link = null;
        }
    }

    function appendLinkLabels(link) {
        len = link.labels();
        for (i; i < len; i++) {
            link.removeLabel(i);
        }

        link.appendLabel({
            markup: [
                {
                    tagName: 'rect',
                    selector: 'source_bg'
                }, {
                    tagName: 'text',
                    selector: 'source_value'
                }
            ],
            attrs: {
                source_bg: {
                    event: 'source:change',
                    opacity: 0.0,
                    stroke: '#222222',
                    strokeWidth: 0,
                    ref: 'source_value',
                    refWidth: +6,
                    refHeight: +2,
                    refX: -3,
                    refY: -1,
                    rx: 2,
                    ry: 2,
                    fill: 'white',
                },
                source_value: {
                    text: '',
                    fill: '#000000',
                    fontSize: 10,
                    textAnchor: 'middle',
                    yAlignment: 'middle',
                },
            },
            position: {
                distance: 18,
            }
        });
        link.appendLabel({
            markup: [
                {   
                    tagName: 'rect',
                    selector: 'target_bg'
                }, {
                    tagName: 'text',
                    selector: 'target_value'
                }
            ],
            attrs: {
                filter: 'unset',
                target_bg: {
                    opacity: 0.0,
                    stroke: '#222222',
                    strokeWidth: 0,
                    ref: 'target_value',
                    refWidth: +6,
                    refHeight: +2, refX: -3,
                    refY: -1,
                    rx: 2,
                    ry: 2,
                    fill: 'white',
                },
                target_value: {
                    text: '',
                    fill: '#000000',
                    fontSize: 10,
                    textAnchor: 'middle',
                    yAlignment: 'middle',
                },
            },
            position: {
                distance: -25,
            }
        });
    }

    function loadDiagram(graph, paper) {
        search_str = '|inputlookup flowchart_kv|eval k=_key|where k="' + panel_id + '"|table defs';
        search.set({search:  search_str});
        search.startSearch();
        loading = true;
        loaded = false;
        results = search.data('results');

        results.on("data", function () {
            if (results.hasData()) {
                graph_str = results.data().rows[0][0];
                graph.fromJSON(JSON.parse(graph_str));
                setInteractive(edit_interactive);
                if (edit_mode == 1) {
                    handleEditMode();
                }
                loaded = true;
            }
        });
    }

    function saveDiagram(graph) {
        flow_str = JSON.stringify(graph.toJSON());
        flow_str = flow_str.replace(/\"/g, "\\\"");
        search_str = '|makeresults| eval id=\"' + panel_id + '\"|eval _key=id|eval defs=\"' + flow_str + '\"|outputlookup append=t flowchart_kv';
        update.set({search:  search_str});
        update.startSearch();
        update.on("search:done", function(state, job) {
            ;
        });
    }

    function initPaper(el) {
        graph = new jointjs.dia.Graph;
        paper = new jointjs.dia.Paper({
            background: {
                color: '#ffffff'
            },
            el: el,
            gridSize: GRIDSIZE,
            width: '100%',
            defaultLink: new jointjs.shapes.flowchart.Link,
            linkPinning: false,
            model: graph,
            defaultConnector: {
                name: 'rounded',
                args: {
                    radius: 10
                }
            }
        });

        paper.el.style.borderTop = 'solid';
        paper.el.style.borderWidth = '0.5px';
        paper.el.style.borderColor= 'lightgray';
    }

    function initStencilPaper(el) {
        stencilGraph = new jointjs.dia.Graph;
        stencilPaper = new jointjs.dia.Paper({
            background: {
                color: '#ffffff'
            },
            el: el,
            //height: 40,
            //width: '100%',
            model: stencilGraph,
            interactive: false
        });

        stencilPaper.scale(0.5);
        stencilPaper.el.style.display = 'none';
        stencilPaper.el.style.border = 'solid';
        stencilPaper.el.style.borderWidth = '0.5px';
        stencilPaper.el.style.borderColor= 'lightgray';
        stencilPaper.el.style.position= 'absolute';
        stencilPaper.el.style.right= '5px';
        stencilPaper.el.style.top= '5px';
        stencilPaper.el.style.float= 'right';
        stencilPaper.el.style.zIndex= '3';
        stencilPaper.el.style.backgroundColor= 'rgba(230, 230, 230, 0.1)';
    }

    function removeNode(elem) {
        ret = confirm("Delete element?");
        if (ret) 
           elem.remove();
    }

    function createNode(cellView, e, x, y) {
        $('body').append('<div id="flyPaper" style="position:fixed;z-index:100;opacity:.7;pointer-event:none;"></div>');
        var flyGraph = new jointjs.dia.Graph,
            flyPaper = new jointjs.dia.Paper({
            gridSize: GRIDSIZE,
            el: $('#flyPaper'),
            model: flyGraph,
            interactive: false
        }),
                
        flyShape = cellView.model.clone(),
            pos = cellView.model.position(),
            offset = { 
                x: GRIDSIZE * Math.round((x - pos.x) / GRIDSIZE),
                y: GRIDSIZE * Math.round((y - pos.y) / GRIDSIZE)
        };

        flyShape.position(0, 0);

        flyGraph.addCell(flyShape);

        $("#flyPaper").offset({
            left: GRIDSIZE * Math.round((e.pageX - offset.x) / GRIDSIZE),
            top: GRIDSIZE * Math.round((e.pageY - offset.y) / GRIDSIZE)
        });

        $('body').on('mousemove.fly', function(e) {
            $("#flyPaper").offset({
                left: GRIDSIZE * Math.round((e.pageX - offset.x) / GRIDSIZE),
                top: GRIDSIZE * Math.round((e.pageY - offset.y) / GRIDSIZE)
            });
        });

        $('body').on('mouseup.fly', function(e) {
            var x = e.pageX,
            y = e.pageY,
            target = paper.$el.offset();

            if (x > target.left && x < target.left + paper.$el.width() && y > target.top && y < target.top + paper.$el.height()) {
                var s = flyShape.clone();
                s.position(x - target.left - offset.x, y - target.top - offset.y);
                graph.addCell(s);
            }

            $('body').off('mousemove.fly').off('mouseup.fly');

            flyShape.remove();
            $('#flyPaper').remove();
        });
    }

    function attachElementFlowId(element) {
        if(edit_mode == 0)
            return;

        label = prompt('Update label');
        element.set('flow-id', label);
        setElementTag(element, label);
    }

    function attachLinkFlowId(link) {
        if(edit_mode == 0)
            return;

        var label = prompt('Update label');
        link.set('flow-id', label);
        setLinkTargetTag(link, label + '_target');
        setLinkSourceTag(link, label + '_source');
    }

    function setElementTag(element, value) {
        if (element == null) 
            return;

        element.attr('label/text', value);
    }

    function setLinkTargetTag(link, value) {
        if (link == null) 
            return;

	link.label(1, {attrs: {target_value: {text: value}}})
    }

    function setLinkSourceTag(link, value) {
        if (link == null) 
            return;

	link.label(0, {attrs: {source_value: {text: value}}})
    }

    function getElementById(id) {
        if (graph == null)
            return null;

        ret = null;
        _.each(graph.getElements(), function(elem) {
            if (elem.attributes['flow-id'] && elem.attributes['flow-id']==id) {
                ret = elem;
            }
        })

        return ret;
    }

    function getCellById(id) {
        if (graph == null)
            return null;

        ret = null;
        _.each(graph.getCells(), function(cell) {
            if (cell.attributes['flow-id'] && cell.attributes['flow-id']==id) {
                ret = cell;
            }
        })
 
        return ret;
    }

    function getLinkById(id) {
        if (graph == null)
            return null;

        ret = null;
        _.each(graph.getLinks(), function(link) {
            if (link.attributes['flow-id'] && link.attributes['flow-id']==id) {
                ret = link;
            }
        })
 
        return ret;
    }

    function getData(value) {
        return value.split(',')[0];
    }

    function getColor(value) {
        l = value.split(',')[1];
        h = value.split(',')[2];
        v = value.split(',')[0];
        if (v < l) {
            return 'red';
        } else if (v < h) {
            return 'orange';
        } else {
            return '#42b9f4';
        }
    }

    function setLinkSourceValue(link, value) {
        if (edit_mode == 1) {
            color = 'black';
            value = link.attributes['flow-id'] + '_source';
        } else {
           color = getColor(value);
        }

        link.label(0, {attrs: {source_value: {text: getData(value)}}});
        link.label(0, {attrs: {source_value: {fill: color}}});
        link.label(0, {attrs: {source_bg: {stroke: color}}});
        link.label(0, {attrs: {source_bg: {strokeWidth: '0.5'}}});
        link.label(0, {attrs: {source_bg: {opacity: '0.8'}}});

        if (getData(value) === '') {
            link.label(0, {attrs: {source_bg: {display: 'none'}}});
        } else {
            link.label(0, {attrs: {source_bg: {display: 'block'}}});
        }
    }

    function setLinkTargetValue(link, value) {
        if (edit_mode == 1) {
            color = 'black';
            value = link.attributes['flow-id'] + '_target';
        } else {
           color = getColor(value);
        }

        link.label(1, {attrs: {target_value: {text: getData(value)}}});
        link.label(1, {attrs: {target_value: {fill: color}}});
        link.label(1, {attrs: {target_bg: {stroke: color}}});
        link.label(1, {attrs: {target_bg: {strokeWidth: '0.5'}}});
        link.label(1, {attrs: {target_bg: {opacity: '0.8'}}});

        if (!getData(value) || getData(value) == null || getData(value) === '') {
            link.label(1, {attrs: {target_bg: {display: 'none'}}});
        } else {
            link.label(1, {attrs: {target_bg: {display: 'block'}}});
        }
    }

    function setInteractive(b) {
        _.each(graph.getCells(), function(cell) {
            view = cell.findView(paper);
            if (view) {
                view.options.interactive = b;
            }
        })
    }

    function setLinkValue(link, value) {
        color = getColor(value);
        link.attr('line/stroke', color);
        link.attr('line/targetMarker/fill', color);
        link.attr('line/strokeWidth', '0.5');
    }

    function setElementValue(elem, value) {
        color = getColor(value);
        elem.attr('body/fill', color);
        elem.attr('border/stroke', color);
        elem.attr('data/text', getData(value));
    }

    function guidGenerator() {
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    function handleEditSource() {
        saveDiagram(graph);
    }

    function handleEditCancel() {
        stencilPaper.el.style.display = 'none';
        edit_mode = 0;
        removeLinkTool();
        stencilGraph.clear();
    }

    function handleEditSave() {
        stencilPaper.el.style.display = 'none';
        edit_mode = 0;

        if (edit_dirty == 1) {
            saveDiagram(graph);
            edit_dirty = 0;
        }

        removeLinkTool();
        stencilGraph.clear();
    }

    function handleEditMode() {
        edit_mode = 1;
        stencilPaper.el.style.display = 'block';
        _.each(graph.getLinks(), function(link) {
            if (link.attributes['flow-id']) {
                link.label(0, {attrs: {source_value: {fill: 'black'}}});
                link.label(0, {attrs: {source_bg: {stroke: '#222222'}}});
                link.label(0, {attrs: {source_value: {text: link.attributes['flow-id'] + '_source'}}});
                link.label(1, {attrs: {target_value: {fill: 'black'}}});
                link.label(1, {attrs: {target_bg: {stroke: '#222222'}}});
                link.label(1, {attrs: {target_value: {text: link.attributes['flow-id'] + '_target'}}});
            }
        })

        var r2 = new jointjs.shapes.flowchart.Process({
            position: {
                x: 30,
                y: 20 
            }
        });

        var r3 = new jointjs.shapes.flowchart.Decision({
            position: {
                x: 120,
                y: 18
            }
        });

        var r4 = new jointjs.shapes.flowchart.State({
            position: {
                x: 217,
                y: 29 
            }
        });
        stencilGraph.addCells([r2, r3, r4]);
        stencilPaper.fitToContent({padding: 10});
        stencilPaper.el.style.display = 'block';

        edit_update = 1;
    }
});

