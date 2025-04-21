from django.db import models
from django.db.models import QuerySet
from typing import Optional
from django.contrib.auth.models import User
from .project_task import ProjectTask, TaskSchema
from pydantic import BaseModel


class ProjectSchema(BaseModel):
    id: int
    owner_username: str
    owner_email: str
    display_name: str
    description: str
    tasks: list[TaskSchema]


# Create your models here.
class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="task")
    name = models.TextField(null=False, default="Default Project")
    display_name = models.TextField(null=False, default="Default Project")
    description = models.TextField()

    def serialize(self: "Project") -> ProjectSchema:
        try:
            linked_tasks: list[ProjectTask] = list(ProjectTask.objects.filter(project=self))
            return ProjectSchema(
                id=self.pk,
                owner_username=self.user.username,
                owner_email=self.user.email,
                display_name=self.display_name,
                description=self.description,
                tasks=[t.serialize() for t in linked_tasks],
            )

        except Project.DoesNotExist:
            return {}

        except Exception as e:
            return {}

    @classmethod
    def get_project_list_for_user(cls, user_id: int) -> list:
        try:
            user: User = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return []
        except Exception as e:
            return []

        project_list: QuerySet[Project] = cls.objects.filter(user=user)
        return [p.serialize().model_dump() for p in project_list]

    @classmethod
    def create(cls, user_id: int, display_name: str, description: Optional[str]) -> "Project":
        try:
            user = User.objects.get(id=user_id)
            project, _ = cls.objects.get_or_create(
                user=user,
                display_name=display_name,
                description=description,
            )
            return project

        except Exception as e:
            print(e)
            raise e
