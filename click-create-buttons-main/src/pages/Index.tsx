import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Eye, EyeOff, Type } from 'lucide-react';

interface FlowchartNode {
  id: string;
  name: string;
  children: FlowchartNode[];
  isEditing: boolean;
  childrenVisible: boolean;
}

interface FlowchartButtonProps {
  node: FlowchartNode;
  onUpdateNode: (nodeId: string, updates: Partial<FlowchartNode>) => void;
  onAddChild: (parentId: string) => void;
  depth: number;
  truncateText: boolean;
}

const FlowchartButton: React.FC<FlowchartButtonProps> = ({ 
  node, 
  onUpdateNode, 
  onAddChild, 
  depth, 
  truncateText 
}) => {
  const [editValue, setEditValue] = useState(node.name);

  const handleDoubleClick = () => {
    onUpdateNode(node.id, { isEditing: true });
    setEditValue(node.name);
  };

  const handleSaveEdit = () => {
    if (editValue.trim()) {
      onUpdateNode(node.id, { name: editValue.trim(), isEditing: false });
    } else {
      setEditValue(node.name);
      onUpdateNode(node.id, { isEditing: false });
    }
  };

  const handleCancelEdit = () => {
    setEditValue(node.name);
    onUpdateNode(node.id, { isEditing: false });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const toggleChildrenVisibility = () => {
    onUpdateNode(node.id, { childrenVisible: !node.childrenVisible });
  };

  // Calculate dynamic width based on text content
  const getButtonWidth = (text: string) => {
    const baseWidth = 8; // minimum width in rem
    const charWidth = 0.7; // approximate character width in rem
    const padding = 4; // padding adjustment in rem
    return Math.max(baseWidth, text.length * charWidth + padding);
  };

  // Truncate text if needed
  const getDisplayText = (text: string) => {
    if (!truncateText || text.length <= 20) return text;
    return text.substring(0, 20) + '...';
  };

  const buttonWidth = getButtonWidth(node.isEditing ? editValue : (truncateText ? getDisplayText(node.name) : node.name));
  const displayText = getDisplayText(node.name);
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Connection line from parent */}
      {depth > 0 && (
        <div className="w-px h-12 bg-gradient-to-b from-primary/60 to-primary/30 mb-3"></div>
      )}
      
      {/* Button container */}
      <div className="relative flex flex-col items-center group">
        {/* Main button with controls */}
        <div className="relative flex items-center gap-2">
          {/* Hide/Show toggle for children */}
          {hasChildren && (
            <Button
              onClick={toggleChildrenVisibility}
              variant="ghost"
              size="sm"
              className="w-7 h-7 rounded-full opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-primary/20"
            >
              {node.childrenVisible ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
            </Button>
          )}

          {/* Main button */}
          {node.isEditing ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleSaveEdit}
              className="h-12 text-center px-4 font-medium transition-all duration-300 border-primary/50 focus:border-primary"
              style={{ width: `${buttonWidth}rem` }}
              autoFocus
            />
          ) : (
            <Button
              variant="interactive"
              size="lg"
              onDoubleClick={handleDoubleClick}
              className="h-12 px-6 font-medium transition-all duration-300 hover:scale-105 hover:shadow-glow whitespace-nowrap shadow-md hover:shadow-lg"
              style={{ width: `${buttonWidth}rem` }}
              title={truncateText && node.name.length > 20 ? node.name : undefined}
            >
              {displayText}
            </Button>
          )}
        </div>

        {/* Add child button */}
        <Button
          onClick={() => onAddChild(node.id)}
          variant="ghost"
          size="sm"
          className="mt-3 w-8 h-8 rounded-full opacity-50 hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-success/20 hover:shadow-md"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Children - only show if visible */}
      {hasChildren && node.childrenVisible && (
        <div className="mt-6 flex flex-col items-center animate-fade-in">
          {/* Connection line to children */}
          <div className="w-px h-8 bg-gradient-to-b from-primary/30 to-primary/60"></div>
          
          {/* Horizontal connector for multiple children */}
          {node.children.length > 1 && (
            <div className="relative mb-6">
              <div 
                className="h-px bg-gradient-to-r from-primary/60 via-primary/80 to-primary/60"
                style={{
                  width: `${(node.children.length - 1) * 14 + 6}rem`,
                }}
              />
              {/* Vertical lines down to each child */}
              {node.children.map((_, index) => (
                <div
                  key={index}
                  className="absolute top-0 w-px h-8 bg-gradient-to-b from-primary/80 to-primary/60"
                  style={{
                    left: `${index * 14}rem`,
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Children container */}
          <div className="flex gap-14 justify-center items-start">
            {node.children.map((child) => (
              <FlowchartButton
                key={child.id}
                node={child}
                onUpdateNode={onUpdateNode}
                onAddChild={onAddChild}
                depth={depth + 1}
                truncateText={truncateText}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Index = () => {
  const [flowchart, setFlowchart] = useState<FlowchartNode>({
    id: 'root',
    name: 'Start',
    children: [],
    isEditing: false,
    childrenVisible: true
  });

  const [truncateText, setTruncateText] = useState(false);

  const updateNode = (nodeId: string, updates: Partial<FlowchartNode>) => {
    const updateNodeRecursive = (node: FlowchartNode): FlowchartNode => {
      if (node.id === nodeId) {
        return { ...node, ...updates };
      }
      return {
        ...node,
        children: node.children.map(updateNodeRecursive)
      };
    };

    setFlowchart(updateNodeRecursive(flowchart));
  };

  const addChild = (parentId: string) => {
    const childId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const addChildRecursive = (node: FlowchartNode): FlowchartNode => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [
            ...node.children,
            {
              id: childId,
              name: `Button ${node.children.length + 1}`,
              children: [],
              isEditing: false,
              childrenVisible: true
            }
          ]
        };
      }
      return {
        ...node,
        children: node.children.map(addChildRecursive)
      };
    };

    setFlowchart(addChildRecursive(flowchart));
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Interactive Flowchart Builder
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Create dynamic flowcharts with expandable nodes
          </p>
          
          {/* Controls */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <Button
              onClick={() => setTruncateText(!truncateText)}
              variant={truncateText ? "default" : "outline"}
              size="sm"
              className="transition-all duration-300 hover:scale-105"
            >
              <Type className="w-4 h-4 mr-2" />
              {truncateText ? 'Show Full Text' : 'Truncate Long Text'}
            </Button>
          </div>
        </div>

        {/* Flowchart Container */}
        <div className="bg-card rounded-2xl p-8 md:p-16 shadow-elegant border border-border min-h-96 overflow-auto">
          <div className="flex justify-center">
            <FlowchartButton
              node={flowchart}
              onUpdateNode={updateNode}
              onAddChild={addChild}
              depth={0}
              truncateText={truncateText}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mt-8 text-sm text-muted-foreground space-y-2">
          <p>🖱️ Double-click buttons to rename • ➕ Click + to add children • 👁️ Click eye to hide/show children</p>
          <p className="text-xs">⌨️ Press Enter to save or Escape to cancel • Buttons resize automatically based on content</p>
        </div>
      </div>
    </div>
  );
};

export default Index;