import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Node,
  SelectionMode,
  useReactFlow,
} from '@xyflow/react';
import { nodeTypes, CanvasNode } from './nodes';
import { LaunchPad } from './launchpad';
import { CanvasToolbar } from './canvas-toolbar';
import { TopToolbar } from './top-toolbar';
import { NodePreview } from './node-preview';

import '@xyflow/react/dist/style.css';
import { useCanvasControl } from '@refly-packages/ai-workspace-common/hooks/use-canvas-control';
import { CanvasProvider } from '@refly-packages/ai-workspace-common/context/canvas';
import { EDGE_STYLES } from './constants';

const selectionStyles = `
  .react-flow__selection {
    background: rgba(0, 150, 143, 0.03) !important;
    border: 0.5px solid #00968F !important;
  }
  
  .react-flow__nodesselection-rect {
    background: rgba(0, 150, 143, 0.03) !important;
    border: 0.5px solid #00968F !important;
  }
`;

const Flow = ({ canvasId }: { canvasId: string }) => {
  const { nodes, edges, mode, setSelectedNode, onNodesChange, onEdgesChange, onConnect, onSelectionChange } =
    useCanvasControl(canvasId);

  const reactFlowInstance = useReactFlow();

  useEffect(() => {
    // Only run fitView if we have nodes and this is the initial render
    const timeoutId = setTimeout(() => {
      if (nodes?.length > 0) {
        reactFlowInstance.fitView({
          padding: 0.2,
          duration: 200,
        });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []); // Run only once on mount

  const defaultEdgeOptions = {
    style: EDGE_STYLES.default,
  };

  const defaultViewport = {
    x: 0,
    y: 0,
    zoom: 1,
  };

  const flowConfig = useMemo(
    () => ({
      defaultViewport,
      fitViewOptions: {
        padding: 0.2,
        minZoom: 0.5,
        maxZoom: 2,
        duration: 200,
      },
      defaultEdgeOptions,
    }),
    [],
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: CanvasNode<any>) => {
      if (!node?.id) {
        console.warn('Invalid node clicked');
        return;
      }
      setSelectedNode(node);
    },
    [setSelectedNode],
  );

  const nodePreview = useMemo(() => {
    const selectedNodes = nodes?.filter((node) => node.selected);
    if (!selectedNodes?.length) return null;

    const selectedNode = selectedNodes[selectedNodes.length - 1];
    const handleClosePanel = useCallback(() => {
      onNodesChange([
        {
          id: selectedNode.id,
          type: 'select',
          selected: false,
        },
      ]);
    }, [selectedNode.id, onNodesChange]);

    return <NodePreview node={selectedNode} handleClosePanel={handleClosePanel} />;
  }, [nodes, onNodesChange]);

  const handleToolSelect = (tool: string) => {
    // Handle tool selection
    console.log('Selected tool:', tool);
  };

  return (
    <div className="w-full h-screen relative flex flex-col">
      <CanvasToolbar onToolSelect={handleToolSelect} />
      <TopToolbar />
      <div className="flex-grow relative">
        <style>{selectionStyles}</style>
        <ReactFlow
          {...flowConfig}
          panOnScroll={mode !== 'pointer'}
          selectNodesOnDrag={mode === 'pointer'}
          selectionMode={mode === 'pointer' ? SelectionMode.Partial : SelectionMode.Full}
          selectionOnDrag={mode === 'pointer'}
          panOnDrag={mode !== 'pointer'}
          nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onSelectionChange={onSelectionChange}
        >
          <Background />
          <MiniMap
            position="bottom-left"
            style={{
              border: '1px solid rgba(16, 24, 40, 0.0784)',
              boxShadow: '0px 4px 6px 0px rgba(16, 24, 40, 0.03)',
            }}
            className="bg-white/80 w-[140px] h-[92px] !mb-[46px] !ml-[10px] rounded-lg shadow-md p-2 [&>svg]:w-full [&>svg]:h-full"
            // zoomable
            // pannable
            // maskColor="rgb(0, 0, 0, 0.1)"
            // nodeColor="#333"
            // nodeStrokeWidth={3}
          />
          <Controls
            position="bottom-left"
            style={{
              marginBottom: '8px',
              marginLeft: '10px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '2px',
              padding: '2px',
              border: '1px solid rgba(16, 24, 40, 0.0784)',
              boxShadow: '0px 4px 6px 0px rgba(16, 24, 40, 0.03)',
              backgroundColor: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              height: '36px',
            }}
            className="[&>button]:border-0 [&>button]:border-r [&>button]:border-gray-200 [&>button:last-child]:border-0 [&>button]:w-[32px] [&>button]:h-[32px] [&>button]:rounded-lg [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:transition-colors [&>button]:duration-200"
            showZoom={true}
            showFitView={true}
            showInteractive={true}
            fitViewOptions={{
              padding: 10,
            }}
          />
        </ReactFlow>

        <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[444px] z-10">
          <LaunchPad />
        </div>
      </div>

      {nodePreview}
    </div>
  );
};

export const Canvas = (props: { canvasId: string }) => {
  const { canvasId } = props;

  return (
    <CanvasProvider canvasId={canvasId}>
      <ReactFlowProvider>
        <Flow canvasId={canvasId} />
      </ReactFlowProvider>
    </CanvasProvider>
  );
};
