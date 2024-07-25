import {
  FaCat,
  FaComments,
  FaDesktop,
  FaMobileAlt,
  FaUserFriends,
} from "react-icons/fa";
import { BiMessageSquareDetail, BiNews, BiSolidCat } from "react-icons/bi";
import { HiUsers } from "react-icons/hi";
import { type AdminProps } from "~/pages/admin";
import { BsImages } from "react-icons/bs";

export default function StatsCard({ counts }: AdminProps) {
  return (
    <div className="flex w-fit flex-col gap-6 rounded-xl bg-white p-6 shadow-lg">
      <h3 className="text-2xl">Stats</h3>
      <div className="flex flex-wrap gap-12">
        <div className="flex flex-col gap-7">
          <h4 className="w-24 border-b-2 border-dotted border-b-slate-200 text-lg text-gray-600">
            Content
          </h4>
          <div className="grid grid-cols-[max-content_1fr] gap-x-5 gap-y-3 text-xl">
            <span className="text-blue-500">{counts.catsCount}</span>
            <div className="flex items-center gap-2">
              <span>Cats</span>
              <FaCat className="ml-auto" />
            </div>
            <span className="text-blue-500">{counts.litterCount}</span>
            <div className="flex items-center gap-2">
              <span>Litters</span>
              <BiSolidCat className="ml-auto" />
            </div>
            <span className="text-blue-500">{counts.kittensCount}</span>
            <div className="flex items-center gap-2">
              <span>Kittens</span>
              <BiSolidCat className="ml-auto" />
            </div>
            <span className="text-blue-500">{counts.blogCount}</span>
            <div className="flex items-center gap-2">
              <span>Blogposts</span>
              <BiNews className="ml-auto" />
            </div>
            <span className="text-blue-500">{counts.usersCount}</span>
            <div className="flex items-center gap-2">
              <span>Users</span>
              <HiUsers className="ml-auto" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-7">
          <h4 className="w-24 border-b-2 border-dotted border-b-slate-200 text-lg text-gray-600">
            Discussions
          </h4>
          <div className="grid grid-cols-[max-content_1fr] gap-x-5 gap-y-3 text-xl">
            <span className="text-blue-500">{counts.commentsCount}</span>
            <div className="flex items-center gap-2">
              <span>Comments</span>
              <FaComments className="ml-auto" />
            </div>
            <span className="text-blue-500">{counts.messageCount}</span>
            <div className="flex items-center gap-2">
              <span>Messages</span>
              <BiMessageSquareDetail className="ml-auto" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-7">
          <h4 className="w-24 border-b-2 border-dotted border-b-slate-200 text-lg text-gray-600">
            Photos
          </h4>
          <div className="grid grid-cols-[max-content_1fr] gap-x-5 gap-y-3 text-xl">
            <span className="text-blue-500">{counts.catImagesCount}</span>
            <div className="flex items-center gap-2">
              <span>Cat images</span>
              <FaCat className="ml-auto" />
            </div>
            <span className="text-blue-500">{counts.litterImagesCount}</span>
            <div className="flex items-center gap-2">
              <span>Kitten images</span>
              <BiSolidCat className="ml-auto" />
            </div>
            <span className="text-blue-700">
              {counts.litterImagesCount + counts.catImagesCount}
            </span>
            <div className="flex items-center gap-2">
              <span>Total images</span>
              <BsImages className="ml-auto" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-7">
          <h4 className="w-24 border-b-2 border-dotted border-b-slate-200 text-lg text-gray-600">
            Visitors
          </h4>
          <div className="grid grid-cols-[max-content_1fr] gap-x-5 gap-y-3 text-xl">
            <span className="text-blue-500">{counts.visitsCount}</span>
            <div className="flex items-center gap-2">
              <span>Unique</span>
              <FaUserFriends className="ml-auto" />
            </div>
            <span className="text-blue-500">
              {counts.mobilePercentage.toFixed(1)}%
            </span>
            <div className="flex items-center gap-2">
              <span>Mobile</span>
              <FaMobileAlt className="ml-auto" />
            </div>
            <span className="text-blue-500">
              {counts.desktopPercentage.toFixed(1)}%
            </span>
            <div className="flex items-center gap-2">
              <span>Desktop</span>
              <FaDesktop className="ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
