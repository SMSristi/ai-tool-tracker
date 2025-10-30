import { useState } from "react";
import { Plus, TrendingUp, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

interface Tool {
  id: string;
  name: string;
  description: string;
  proficiency: number;
}

const Index = () => {
  const [tools, setTools] = useState<Tool[]>([
    {
      id: "1",
      name: "ChatGPT",
      description: "Advanced conversational AI for natural language processing and content generation",
      proficiency: 4,
    },
    {
      id: "2",
      name: "GitHub Copilot",
      description: "AI pair programmer that helps write code faster with intelligent suggestions",
      proficiency: 5,
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [newTool, setNewTool] = useState({
    name: "",
    description: "",
    proficiency: "3",
  });

  const handleAddTool = () => {
    if (newTool.name.trim() && newTool.description.trim()) {
      if (editingTool) {
        // Update existing tool
        setTools(tools.map(tool => 
          tool.id === editingTool.id 
            ? { ...tool, name: newTool.name, description: newTool.description, proficiency: parseInt(newTool.proficiency) }
            : tool
        ));
        setEditingTool(null);
      } else {
        // Add new tool
        const tool: Tool = {
          id: Date.now().toString(),
          name: newTool.name,
          description: newTool.description,
          proficiency: parseInt(newTool.proficiency),
        };
        setTools([...tools, tool]);
      }
      setNewTool({ name: "", description: "", proficiency: "3" });
      setIsDialogOpen(false);
    }
  };

  const handleEditTool = (tool: Tool) => {
    setEditingTool(tool);
    setNewTool({
      name: tool.name,
      description: tool.description,
      proficiency: tool.proficiency.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDeleteTool = (id: string) => {
    setTools(tools.filter(tool => tool.id !== id));
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTool(null);
    setNewTool({ name: "", description: "", proficiency: "3" });
  };

  const getProficiencyColor = (level: number) => {
    const colors = [
      "bg-muted text-muted-foreground",
      "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    ];
    return colors[level] || colors[0];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent">
                AI Tools Tracker
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Track and manage your AI development tools
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Tool
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingTool ? "Edit Tool" : "Add New Tool"}</DialogTitle>
                  <DialogDescription>
                    {editingTool ? "Update your AI development tool" : "Add a new AI development tool to your tracker"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Tool Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., ChatGPT, GitHub Copilot"
                      value={newTool.name}
                      onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this tool does..."
                      value={newTool.description}
                      onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="proficiency">Proficiency Level</Label>
                    <Select
                      value={newTool.proficiency}
                      onValueChange={(value) => setNewTool({ ...newTool, proficiency: value })}
                    >
                      <SelectTrigger id="proficiency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Beginner</SelectItem>
                        <SelectItem value="2">2 - Basic</SelectItem>
                        <SelectItem value="3">3 - Intermediate</SelectItem>
                        <SelectItem value="4">4 - Advanced</SelectItem>
                        <SelectItem value="5">5 - Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTool}>{editingTool ? "Update Tool" : "Add Tool"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="p-8">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-card-foreground">Your Tools</h2>
            </div>
            {tools.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No tools added yet. Click "Add Tool" to get started!</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[140px] text-center">Proficiency</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tools.map((tool) => (
                      <TableRow key={tool.id}>
                        <TableCell className="font-medium">{tool.name}</TableCell>
                        <TableCell className="text-muted-foreground">{tool.description}</TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getProficiencyColor(
                              tool.proficiency
                            )}`}
                          >
                            {tool.proficiency}/5
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTool(tool)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTool(tool.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
