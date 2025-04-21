from django.db import models
from django.contrib.auth.models import User
from pydantic import BaseModel


class TaskSchema(BaseModel):
    id: int
    project_title: str
    title: str
    priority: int
    status: int
    description: str
    is_daily_task: int


class PriorityChoices:
    HIGH = 0
    MEDIUM = 1
    LOW = 2


class TaskState:
    TODO = 0
    IN_PROGRESS = 1
    COMPLETED = 2
    DROPPED = 3


PRIORITY_CHOICES = (
    (PriorityChoices.HIGH, 0),
    (PriorityChoices.MEDIUM, 1),
    (PriorityChoices.LOW, 2),
)

STATUS_CHOICES = (
    (TaskState.TODO, 0),
    (TaskState.IN_PROGRESS, 1),
    (TaskState.COMPLETED, 2),
    (TaskState.DROPPED, 3),
)


# Create your models here.
class ProjectTask(models.Model):
    project = models.ForeignKey("Project", on_delete=models.CASCADE, related_name="project_task")
    title = models.TextField(null=False, default="Default Task")
    priority = models.IntegerField(
        choices=PRIORITY_CHOICES,
        default=PriorityChoices.MEDIUM,
    )
    status = models.IntegerField(
        choices=STATUS_CHOICES,
        default=TaskState.TODO,
    )
    description = models.TextField()
    is_daily_task = models.BooleanField(default=False)
    deadline = models.DateField(null=True)
    calendar_linked_date = models.DateField(null=True)
    # dependencies = models.ManyToManyField("Task", related_name="dependencies")

    class Meta:
        unique_together = ("project", "title")

    def serialize(self) -> TaskSchema:
        return TaskSchema(
            id=self.pk,
            project_title=self.project.display_name,
            title=self.title,
            priority=self.priority,
            status=self.status,
            description=self.description,
            is_daily_task=self.is_daily_task,
        )

    @classmethod
    def create(cls, project: "Project", task_data: dict, **kwargs) -> tuple["ProjectTask", bool]:
        task, _ = cls.objects.get_or_create(
            project=project,
            title=task_data["title"],
            defaults={
                "description": task_data.get("description"),
                "priority": task_data.get("priority"),
                "status": task_data.get("status"),
                "is_daily_task": task_data.get("is_daily_task"),
                "deadline": task_data.get("deadline"),
            },
        )

        return task, _

    @classmethod
    def get_all_tasks(cls, project: "Project") -> list[dict]:
        all_tasks = cls.objects.select_related("project").filter(project=project)
        return [task.serialize().model_dump() for task in all_tasks]

    @classmethod
    def get_task_for_user(cls, user_id: int) -> "ProjectTask":
        tasks= cls.objects.select_related("project").filter(project__user_id=user_id)
        return [task.serialize().model_dump() for task in tasks]
