import * as React from "react"
import ProjectConciseView from "./ProjectConciseView"

interface ProjectListProps {
  projectList: {
    display_name: string;
    owner_username: string;
    owner_email: string;
    id: number;
    description: string;
    tasks: {
        id: number;
        title: string;
        description: string;
        due_date: string;
        status: string;
    }[];
  }[];
}

function displayProjectList({projectList}: ProjectListProps) {
    console.log(projectList)
    return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
            { projectList.map((project) => (
                <ProjectConciseView project={project} />
                // <h1>{project.display_name}</h1>
            ))}
        </div>
    )
}
function ProjectList({ projectList }: ProjectListProps) {
return (

    <div>
        {!projectList || projectList.length === 0 ? (
            <div>No projects found</div>
        ) : displayProjectList({projectList})}
        
    </div>
)
};

export default ProjectList;

