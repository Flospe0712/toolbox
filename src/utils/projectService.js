export async function getAllProjects() {
  try {
    const res = await fetch('/api/projects');
    return await res.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getProject(id) {
  try {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) throw new Error('Project not found');
    return await res.json();
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    return null;
  }
}

export async function createProject(name) {
  try {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error('Failed to create project');
    return await res.json();
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
}

export async function saveProject(projectId, data) {
  try {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to save project');
    return await res.json();
  } catch (error) {
    console.error('Error saving project:', error);
    return null;
  }
}

export async function deleteProject(projectId) {
  try {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete project');
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}
