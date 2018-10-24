define([
    'jquery',
    'underscore',
    'jointjs'
], function (
    $,
    _,
    jointjs
) {
        const BACKGROUND_COLOR = '#42b9f4';

        jointjs.dia.Link.define('flowchart.Link', {
            attrs: {
                line: {
                    connection: true,
                    stroke: '#222222',
                    strokeWidth: 0.25,
                    strokeLinejoin: 'round',
                    targetMarker: {
                        'type': 'path',
                        'd': 'M 7 -3.5 0 0 7 3.5 z',
                        stroke: 'white',
                        strokeWidth: 0.5,
                        fill: 'black',
                    },
                    z: -1,
                    connectionPoint: {
                        name: 'bbox',
                        args: { stroke: true },
                    }
                },
                wrapper: {
                    connection: true,
                    strokeWidth: 5,
                    strokeLinejoin: 'round'
                }
            },
            markup: [{
                tagName: 'path',
                selector: 'wrapper',
                attributes: {
                    'fill': 'none',
                    'cursor': 'pointer',
                    'stroke': 'transparent'
                }
            }, {
                tagName: 'path',
                selector: 'line',
                attributes: {
                    'fill': 'none',
                }
            }]
        });

        const PROCESS_SIZE = 65;
        const PROCESS_RADIUS_SIZE = 3;
        const PROCESS_D = '' +
            'M ' + (PROCESS_SIZE - PROCESS_RADIUS_SIZE) + ' 0 ' +
            'A ' + PROCESS_RADIUS_SIZE + ' ' + PROCESS_RADIUS_SIZE + ' 0 0 1 ' + PROCESS_SIZE + ' ' + PROCESS_RADIUS_SIZE + ' ' +
            'L ' + PROCESS_SIZE + ' ' + (PROCESS_SIZE - PROCESS_RADIUS_SIZE) + ' ' +
            'A ' + PROCESS_RADIUS_SIZE + ' ' + PROCESS_RADIUS_SIZE + ' 0 0 1 ' + (PROCESS_SIZE - PROCESS_RADIUS_SIZE) + ' ' + PROCESS_SIZE + ' ' +
            'L ' + PROCESS_RADIUS_SIZE + ' ' + PROCESS_SIZE + ' ' +
            'A ' + PROCESS_RADIUS_SIZE + ' ' + PROCESS_RADIUS_SIZE + ' 0 0 1 ' + 0 + ' ' + (PROCESS_SIZE - PROCESS_RADIUS_SIZE) + ' ' +
            'L ' + 0 + ' ' + PROCESS_RADIUS_SIZE + ' ' +
            'A ' + PROCESS_RADIUS_SIZE + ' ' + PROCESS_RADIUS_SIZE + ' 0 0 1 ' + PROCESS_RADIUS_SIZE + ' ' + 0 + ' ' +
            'z'

        jointjs.dia.Element.define('flowchart.Process', {
            attrs: {
                border: {
                    connection: true,
                    strokeWidth: 4,
                    stroke: BACKGROUND_COLOR,
                    fill: 'none',
                    strokeLineJoin: 'round',
                    //filter: { name: 'dropShadow', args: { dx: 1, dy: 1, blur: 1, color: '#223322' } },
                    d: PROCESS_D,
                    zIndex: 100,
                    magnet: true,
                    cursor: 'pointer',
                },
                body: {
                    connection: true,
                    strokeWidth: 0,
                    fill: BACKGROUND_COLOR,
                    strokeLineJoin: 'round',
                    d: PROCESS_D,
                    zIndex: 5,
                },
                label: {
                    text: 'name me',
                    textVerticalAnchor: 'middle',
                    textAnchor: 'middle',
                    ref: 'body',
                    refX: (PROCESS_SIZE + 1) / 2,
                    refY: (PROCESS_SIZE + 1) / 2,
                    fontSize: 12,
                    fill: 'white',
                    'cursor': 'default',
                },
                data: {
                    text: '',
                    textVerticalAnchor: 'middle',
                    textAnchor: 'middle',
                    ref: 'body',
                    refX: (PROCESS_SIZE + 1) / 2,
                    refY: (PROCESS_SIZE + 1) / 2 + 20,
                    fontSize: 10,
                    fill: 'white',
                    'cursor': 'default',
                },
            },
            markup: [{
                tagName: 'path',
                selector: 'border',
            }, {
                tagName: 'path',
                selector: 'body',
            }, {
                tagName: 'text',
                selector: 'label',
            }, {
                tagName: 'text',
                selector: 'data'
            }]
        });

        const DECISION_SIZE = 50;
        const DECISION_DIAG = Math.sqrt(DECISION_SIZE * DECISION_SIZE * 2);
        const RADIUS_SIZE = 3;
        const DECISION_RADIUS_SIZE = Math.sqrt(RADIUS_SIZE * RADIUS_SIZE / 2);
        const DECISION_RADIUS_OFFSET = Math.sqrt(RADIUS_SIZE * RADIUS_SIZE * 2);
        const DECISION_D = '' +
            'M ' + (DECISION_DIAG / 2 - DECISION_RADIUS_SIZE) + ' ' + DECISION_RADIUS_SIZE + ' ' +
            'A ' + DECISION_RADIUS_OFFSET + ' ' + DECISION_RADIUS_OFFSET + ' 0 0 1 ' + (DECISION_DIAG / 2 + DECISION_RADIUS_SIZE) + ' ' + DECISION_RADIUS_SIZE + ' ' +
            'L ' + (DECISION_DIAG - DECISION_RADIUS_SIZE) + ' ' + (DECISION_DIAG / 2 - DECISION_RADIUS_SIZE) + ' ' +
            'A ' + DECISION_RADIUS_OFFSET + ' ' + DECISION_RADIUS_OFFSET + ' 0 0 1 ' + (DECISION_DIAG - DECISION_RADIUS_SIZE) + ' ' + (DECISION_DIAG / 2 + DECISION_RADIUS_SIZE) + ' ' +
            'L ' + (DECISION_DIAG / 2 + DECISION_RADIUS_SIZE) + ' ' + (DECISION_DIAG - DECISION_RADIUS_SIZE) + ' ' +
            'A ' + DECISION_RADIUS_OFFSET + ' ' + DECISION_RADIUS_OFFSET + ' 0 0 1 ' + (DECISION_DIAG / 2 - DECISION_RADIUS_SIZE) + ' ' + (DECISION_DIAG - DECISION_RADIUS_SIZE) + ' ' +
            'L ' + (DECISION_DIAG / 2 - DECISION_DIAG / 2 + DECISION_RADIUS_SIZE) + ' ' + (DECISION_DIAG / 2 + DECISION_RADIUS_SIZE) + ' ' +
            'A ' + DECISION_RADIUS_OFFSET + ' ' + DECISION_RADIUS_OFFSET + ' 0 0 1 ' + (0 + DECISION_RADIUS_SIZE) + ' ' + (DECISION_DIAG / 2 - DECISION_RADIUS_SIZE) + ' ' +
            'z';

        jointjs.dia.Element.define('flowchart.Decision', {
            attrs: {
                border: {
                    connection: true,
                    strokeWidth: 4,
                    stroke: BACKGROUND_COLOR,
                    fill: 'none',
                    //filter: { name: 'dropShadow', args: { dx: 1, dy: 1, blur: 1, color: '#223322' } },
                    d: DECISION_D,
                    zIndex: 1,
                    magnet: true,
                    cursor: 'pointer',
                },
                body: {
                    ref: 'border',
                    connection: true,
                    fill: BACKGROUND_COLOR,
                    d: DECISION_D,
                    zIndex: 5,
                },
                label: {
                    text: 'name me',
                    textVerticalAnchor: 'middle',
                    textAnchor: 'middle',
                    ref: 'body',
                    refX: DECISION_DIAG / 2,
                    refY: DECISION_DIAG / 2,
                    fontSize: 12,
                    fill: 'white',
                    'cursor': 'default',
                }
            },
            markup: [{
                tagName: 'path',
                selector: 'border',
            }, {
                tagName: 'path',
                selector: 'body',
            }, {
                tagName: 'text',
                selector: 'label'
            }]
        });

        STATE_RADIUS = 25;
        STATE_D = '' +
            /*'M ' + 0 + ' ' + STATE_RADIUS + ' ' + 
            'A ' + STATE_RADIUS + ' ' + STATE_RADIUS + ' 0 0 1 ' + STATE_RADIUS + ' ' + 0 + ' ' + 
            'A ' + STATE_RADIUS + ' ' + STATE_RADIUS + ' 0 0 1 ' + STATE_RADIUS*2 + ' ' + STATE_RADIUS + ' ' +
            'A ' + STATE_RADIUS + ' ' + STATE_RADIUS + ' 0 0 1 ' + STATE_RADIUS + ' ' + STATE_RADIUS*2 + ' ' +
            'A ' + STATE_RADIUS + ' ' + STATE_RADIUS + ' 0 0 1 ' + 0 + ' ' + STATE_RADIUS + ' ' +
            'z'*/
            'M ' + STATE_RADIUS + ' ' + 0 + ' ' +
            'A ' + STATE_RADIUS + ' ' + STATE_RADIUS + ' 0 0 1 ' + STATE_RADIUS * 2 + ' ' + STATE_RADIUS + ' ' +
            'A ' + STATE_RADIUS + ' ' + STATE_RADIUS + ' 0 0 1 ' + STATE_RADIUS + ' ' + STATE_RADIUS * 2 + ' ' +
            'A ' + STATE_RADIUS + ' ' + STATE_RADIUS + ' 0 0 1 ' + 0 + ' ' + STATE_RADIUS + ' ' +
            'A ' + STATE_RADIUS + ' ' + STATE_RADIUS + ' 0 0 1 ' + STATE_RADIUS + ' ' + 0 + ' ' +
            'z'
        jointjs.dia.Element.define('flowchart.State', {
            attrs: {
                border: {
                    /*r: STATE_RADIUS,
                    strokeWidth: 4,
                    stroke: BACKGROUND_COLOR,
                    fill: 'none',
                    //filter: { name: 'dropShadow', args: { dx: 1, dy: 1, blur: 1, color: '#223322' } },
                    magnet: true,
                    cursor: 'pointer',
                    zIndex: 1,*/
                    connection: true,
                    strokeWidth: 4,
                    stroke: BACKGROUND_COLOR,
                    fill: 'none',
                    //filter: { name: 'dropShadow', args: { dx: 1, dy: 1, blur: 1, color: '#223322' } },
                    d: STATE_D,
                    zIndex: 1,
                    magnet: true,
                    cursor: 'pointer',
                },
                body: {
                    /*ref: 'border',
                    r: STATE_RADIUS,
                    fill: BACKGROUND_COLOR,
                    zIndex: 5,*/
                    ref: 'border',
                    connection: true,
                    fill: BACKGROUND_COLOR,
                    d: STATE_D,
                    zIndex: 5,
                },
                label: {
                    text: 'name me',
                    textVerticalAnchor: 'middle',
                    textAnchor: 'middle',
                    ref: 'body',
                    refX: (STATE_RADIUS * 2 + 1) / 2,
                    refY: (STATE_RADIUS * 2 + 1) / 2,
                    fontSize: 12,
                    fill: 'white',
                    'cursor': 'default',
                }
            },
            markup: [{
                tagName: 'path',
                selector: 'border',
            }, {
                tagName: 'path',
                selector: 'body',
            }, {
                tagName: 'text',
                selector: 'label'
            }]
        });

        jointjs.dia.Element.define('flowchart.Box', {
            attrs: {
                border: {
                    connection: true,
                    strokeWidth: 1,
                    stroke: 'darkgray',
                    cursor: 'default',
                },
                topleft: {
                    ref: 'border',
                    event: 'topleft:pointerdown',
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: 0,
                    refY: 0,
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(-45)',
                    display: 'none',
                },
                left: {
                    ref: 'border',
                    event: 'topleft:pointerdown',
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: 0,
                    refY: "+50%",
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(-90)',
                    display: 'none',
                },
                bottomleft: {
                    ref: 'border',
                    event: 'topleft:pointerdown',
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: 0,
                    refY: "+100%",
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(-135)',
                    display: 'none',
                },
                bottom: {
                    ref: 'border',
                    event: 'topleft:pointerdown',
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: "+50%",
                    refY: "+100%",
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(-180)',
                    display: 'none',
                },
                bottomright: {
                    ref: 'border',
                    event: 'topleft:pointerdown',
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: "+100%",
                    refY: "+100%",
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(-225)',
                    display: 'none',
                },
                right: {
                    ref: 'border',
                    event: 'topleft:pointerdown',
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: "+100%",
                    refY: "+50%",
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(-270)',
                    display: 'none',
                },
                topright: {
                    ref: 'border',
                    event: 'topleft:pointerdown',
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: "+100%",
                    refY: 0,
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(-315)',
                    display: 'none',
                },
                top: {
                    ref: 'border',
                    event: 'topleft:pointerdown',
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: "+50%",
                    refY: 0,
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(0)',
                    display: 'none',
                },
                topleft: {
                    ref: 'border',
                    event: 'topleft:pointerdown',
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: 0,
                    refY: 0,
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(-45)',
                    display: 'none',
                },
                label: {
                    text: 'name me',
                    textVerticalAnchor: 'middle',
                    textAnchor: 'middle',
                    ref: 'border',
                    refX: 20,
                    refY: 20,
                    fontSize: 12,
                    fill: 'darkgray',
                    'cursor': 'default',
                },
            },
            markup: [{
                tagName: 'path',
                selector: 'border',
            }, {
                tagName: 'path',
                selector: 'topleft',
            }, {
                tagName: 'path',
                selector: 'left',
            }, {
                tagName: 'path',
                selector: 'bottomleft',
            }, {
                tagName: 'path',
                selector: 'bottom',
            }, {
                tagName: 'path',
                selector: 'bottomright',
            }, {
                tagName: 'path',
                selector: 'right',
            }, {
                tagName: 'path',
                selector: 'topright',
            }, {
                tagName: 'path',
                selector: 'top',
            }, {
                tagName: 'text',
                selector: 'label'
            }]
        });
    }
)
