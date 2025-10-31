import { useState, useEffect } from "react";
import { Plus, TrendingUp, Pencil, Trash2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// removed unused Select imports after switching to numeric Input for proficiency
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface Tool {
  id: string;
  name: string;
  description: string;
  proficiency: number;
}

const Index = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("tools")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tools:", error);
      } else {
        const mappedTools: Tool[] = (data || []).map((tool: any) => ({
          id: tool.id,
          name: tool.name,
          description: tool.description,
          proficiency: tool.proficiency,
        }));
        setTools(mappedTools);
      }
    } catch (error) {
      console.error("Error fetching tools:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch tools from Supabase when component mounts
    fetchTools();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  const [newTool, setNewTool] = useState({
    name: "",
    description: "",
    category: "",
    proficiency: "3",
  });

  const handleAddTool = async () => {
    if (newTool.name.trim() && newTool.description.trim()) {
      try {
        // Add new tool to Supabase
        const { error } = await (supabase as any)
          .from("tools")
          .insert([
            {
              name: newTool.name,
              description: newTool.description,
              proficiency: parseInt(newTool.proficiency),
            },
          ]);

        if (error) {
          console.error("Error adding tool:", error);
          return;
        }

        // Optional webhook
        try {
          fetch("https://smsristi.app.n8n.cloud/webhook-test/abf7ecc1-5253-441c-aa28-7d2e4183707d", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newTool),
          });
        } catch (error) {
          console.error("Failed to send POST request:", error);
        }

        await fetchTools();
        setNewTool({ name: "", description: "", category: "", proficiency: "3" });
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Error in handleAddTool:", error);
      }
    }
  };

  const startEditingTool = (tool: Tool) => {
    setEditingTool(tool);
    setNewTool({
      name: tool.name,
      description: tool.description,
      category: "",
      proficiency: tool.proficiency.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleEditTool = async () => {
    if (!editingTool) return;
    try {
      const { error } = await (supabase as any)
        .from("tools")
        .update({
          name: newTool.name,
          description: newTool.description,
          proficiency: parseInt(newTool.proficiency),
        })
        .eq("id", editingTool.id);

      if (error) {
        console.error("Error updating tool:", error);
        return;
      }

      await fetchTools();
      setEditingTool(null);
      setNewTool({ name: "", description: "", category: "", proficiency: "3" });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error in handleEditTool:", error);
    }
  };

  const handleDeleteTool = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from("tools")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting tool:", error);
        return;
      }

      await fetchTools();
    } catch (error) {
      console.error("Error in handleDeleteTool:", error);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTool(null);
    setNewTool({ name: "", description: "", category: "", proficiency: "3" });
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
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
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
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g., IDE, Chatbot, Testing, Deployment"
                      value={newTool.category}
                      onChange={(e) => setNewTool({ ...newTool, category: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="proficiency">Proficiency</Label>
                    <Input
                      id="proficiency"
                      type="number"
                      min={1}
                      max={5}
                      value={newTool.proficiency}
                      onChange={(e) => setNewTool({ ...newTool, proficiency: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button onClick={editingTool ? handleEditTool : handleAddTool}>{editingTool ? "Update Tool" : "Add Tool"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </header>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="p-8">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-card-foreground">Your Tools</h2>
            </div>
            {loading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Loading tools...</p>
              </div>
            ) : tools.length === 0 ? (
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
                              onClick={() => startEditingTool(tool)}
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
