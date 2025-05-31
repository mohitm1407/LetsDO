from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from note_manager.models import Meeting
from pydantic import BaseModel
from typing import List


class NewMeetingSchema(BaseModel):
    title: str
    description: str
    # Annotate as datetime but parse from ISO string
    start_time: str
    end_time: str
    tasks: List[int]


class NewMeetingView(APIView):

    def post(self, request) -> Response:

        try:
            print(request.data)
            meeting_details = NewMeetingSchema.model_validate(request.data)
            print("HERE")
            meeting = Meeting.create_meeting(meeting_details.model_dump())
            print("HERE 2")
            return Response(meeting.serialize().model_dump(), status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_401_UNAUTHORIZED)
