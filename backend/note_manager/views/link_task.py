from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from note_manager.models.meeting import Meeting
from pydantic import BaseModel


class LinkTaskSchema(BaseModel):
    task_ids: list[int]


class LinkTasksView(APIView):

    def post(self, request, meeting_id: int) -> Response:
        try:
            meeting = Meeting.get_meeting(meeting_id=meeting_id)
            task_ids = LinkTaskSchema.model_validate(request.data)
            meeting.link_tasks(task_ids.task_ids)
            return Response(meeting.serialize(), status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_401_UNAUTHORIZED)
